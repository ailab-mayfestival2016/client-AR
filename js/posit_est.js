console.log("load posit_est.js");

var POSITEST = POSITEST || {};

//require

//mapdata�̃t�H�[�}�b�g
//�}�[�J�[�̔z��@�e�}�[�J�[��id��pos,mat,size���L�[�Ƃ��Ď���
//id�@�}�[�J�[��ID�Ő���
//pos�@�}�[�J�[�̒��S�̈ʒu�̐�΍��W
//mat �}�[�J�[��������ɂ������Ƃ��A�E�A��O�A����u,v,w���ƒ�`����@�e��ɏ���u,v,w���[�߂�ꂽ�s��
//size �}�[�J�[�̐�΍��W�ɂ�����T�C�Y
POSITEST.positionEstimater = function(mapdata){
	this.n_marker = mapdata.length
	this.pos = {};
	this.mat = {};
	this.size = {};
	for(var i=0;i<this.n_marker;i++){
		var id = mapdata[i].id;
		
		this.pos[id] = mapdata[i].pos;
		this.mat[id] = mapdata[i].mat;
		this.size[id] = mapdata[i].size;
	}
	
	this.jsArucoMarker = new THREEx.JsArucoMarker();
	
	console.log("est_pos defined");
	this.est_pos = function (domElement){
		//�}�[�J�[�̎擾
		var _this = this;
		var markers = this.jsArucoMarker.detectMarkers(domElement);
		
		if(markers.length==0){
			console.log("No Marker Detected");
			return null;
		}else{
			console.log(sprintf("%d Markers Detected",markers.length));
		}
		
		//���ώp���s��[I,J,K]
		var R_ = [[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]];
		
		//�}�[�J�[�̃T�C�Y���l�������A�e�}�[�J�[����J�����ւ̃x�N�g��(�J�������W�n)
		var cam_vec = []
		//�}�[�J�[�̈ʒu
		var marker_vec = []
		
		var counter = 0;
		markers.forEach(function (marker){
			var id = marker.id;
			//console.log(sprintf("detect Marker ID %d",id));
			
			//�z��O�̃}�[�J�[�Ȃ珜�O
			if(!(id in _this.mat)){
				console.log("Not in map");
				return;
			}
			
			var pos = _this.jsArucoMarker.getMarkerPosition(marker);
			var rot = pos.bestRotation;
			//���Ƃ��Ƃ̃J�����A�}�[�J�[���W�n���E��n�Ȃ̂ŏC��
			rot = [[rot[0][0], rot[0][1], -rot[0][2]],
					[rot[1][0], rot[1][1], -rot[1][2]],
					[-rot[2][0], -rot[2][1], rot[2][2]]];
			var trans = pos.bestTranslation;
			
			//FOR DEBUG
			/*
			console.log("rot");
			for(var i=0;i<3;i++){
				console.log(vsprintf("%.2f %.2f %.2f",rot[i]));
			}
			console.log(vsprintf("%.2f %.2f %.2f",trans));
			*/
			//���ς����߂邽�߂ɑ������킹�Ă���
			var global_R = numeric.dot(_this.mat[id], numeric.transpose(rot));
			R_ = numeric.add(R_, global_R);
			
			//�}�[�J�[���J�����̃x�N�g���i�J�������W�n�j
			cam_vec.push(numeric.mul([-trans[0], -trans[1], trans[2]], _this.size[id]));
			
			marker_vec.push(_this.pos[id]);
			
			counter = counter + 1;
		});
		
		if(counter<2){
			console.log("failed to detect more than 1 markers");
			return null; 
		}
		
		//���ώp���s������߂�
		//reference: http://home.hiroshima-u.ac.jp/tamaki/study/20090924SIS200923.pdf
		R_ = numeric.mul(R_, 1.0/counter);
		var ret = numeric.svd(R_);
		R_ = numeric.dot(ret.U, numeric.transpose(ret.V));
		
		//FOR DEBUG
		/*
		console.log("R_");
		for(var i=0;i<3;i++){
			console.log(vsprintf("%.2f %.2f %.2f",R_[i]));
		}
		for(var i=0;i<counter;i++){
			console.log(sprintf("--- marker %d ---",i));
			console.log(vsprintf("d %.2f %.2f %.2f",cam_vec[i]));
			console.log(vsprintf("m %.2f %.2f %.2f",marker_vec[i]));
		}*/
		
		//�J�����̈ʒu�𐄒�
		var width = domElement.width;
		
		//�����l�ݒ�
		var f = 1.0;
		var A = [0.0,0.0,f]
		var x = numeric.add(marker_vec[0], numeric.dot(R_, numeric.mul(A, cam_vec[0])));
		var prev_x = null;
		
		var n_iter = 0;
		var max_iter = 1000;
		var min_err = 1.0;
		while(n_iter<max_iter){
			//console.log(sprintf("f %.2f",f));
			//console.log(sprintf("x %.2f %.2f %.2f",x[0],x[1],x[2]));
			var A = [1.0,1.0,f];
			var I = [0.0,0.0,1.0];
			//�w�b�Z�s��p�o�b�t�@
			var B = [[0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0],[0.0,0.0,0.0,0.0]];
			//���z�p�o�b�t�@
			var D = [0.0,0.0,0.0,0.0];
			//
			for(var i=0;i<counter;i++){
				var m = marker_vec[i];
				var d = cam_vec[i];
				//
				var RAfd = numeric.dot(R_, numeric.mul(A, d));
				var RId = numeric.dot(R_, numeric.mul(I, d));
				//���z
				var dJdx = numeric.sub(x, numeric.add(m, RAfd));
				var dJdf = - numeric.dot(dJdx, RId);
				D[0]+=dJdx[0]; D[1]+=dJdx[1]; D[2]+=dJdx[2]; D[3]+=dJdf;
				//�w�b�Z�s��
				B[0][0]+=1.0; B[1][1]+=1.0; B[2][2]+=1.0; //ddJddx
				var ddJdxdf = numeric.mul(RId, -1.0);
				B[3][0]+=ddJdxdf[0]; B[0][3]+=ddJdxdf[0];
				B[3][1]+=ddJdxdf[1]; B[1][3]+=ddJdxdf[1];
				B[3][2]+=ddJdxdf[2]; B[2][3]+=ddJdxdf[2];
				B[3][3]+=numeric.dot(RId,RId);//ddJddf
			}
			//
			var Binv = numeric.inv(B);
			var delta = numeric.mul(numeric.dot(Binv, D), -1.0); //���j���[�g���@
			
			prev_x = numeric.clone(x);
			x[0]+=delta[0]; x[1]+=delta[1]; x[2]+=delta[2];
			f += delta[3];
			
			
			//�I������
			if(prev_x == null){
				
			}else if(numeric.norm2(numeric.sub(x, prev_x))<min_err){
				break;
			}
			//�X�V����
			n_iter = n_iter + 1;
		}
		//console.log(sprintf("performed %d iterations",n_iter));
		
		return {"x":x, "R":R_, "f":f};
	}
}

console.log("finish load posit_est.js");