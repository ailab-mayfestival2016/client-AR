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
	
	//memo
	//ids �}�[�J�[��ID�̔z��
	//rots threex�ɂ�蓾��ꂽ��]�s��̔z��
		//�e�s���}�[�J�[��u,v,w���W�n�ŃJ�������W�i�e���@�E-��-��O�@����j�̊e���������Ƃ��̃x�N�g��
	//trans threex�ɂ�蓾��ꂽtranslation
		//�J�������W�i�e�����ꂼ��E�A��A���s���@����łȂ��I�j�ɂ�����A�œ_����1.0�A�摜��1.0
		//�}�[�J�[�̑傫��1.0�Ƃ����Ƃ��̃}�[�J�[�����̍��W
		//�œ_�����s���Ȃ��߁A���s���Ɏ��R�x������
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
			console.log(sprintf("detect Marker ID %d",id));
			
			//�z��O�̃}�[�J�[�Ȃ珜�O
			if(!(id in _this.mat)){
				console.log("Not in map");
				return;
			}
			
			var pos = _this.jsArucoMarker.getMarkerPosition(marker);
			var rot = pos.bestRotation;
			var trans = pos.bestTranslation;
			
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
		
		//�J�����̈ʒu�𐄒�
		var width = domElement.width;
		
		//�����l�ݒ�
		var f = width;
		var A = [0.0,0.0,f]
		var x = marker_vec[0] + numeric.dot(R_, numeric.mul(A, cam_vec[0]));
		var prev_x = null;
		
		var n_iter = 0;
		var max_iter = 100;
		var min_err = 1.0;
		while(n_iter<max_iter){
			var A = [0.0,0.0,f];
			var I = [0.0,0.0,1.0];
			//
			var x_sum = [0.0,0.0,0.0];
			var f_up_sum = 0.0;
			var f_low_sum = 0.0;
			
			for(var i = 0; i<counter; i++){
				x_sum = numeric.add(x_sum, numeric.add(marker_vec[i], numeric.dot(R_, numeric.mul(A, cam_vec[i]))));
				
				f_up_sum = f_up_sum + numeric.dot( numeric.add(x,marker_vec[i]), numeric.dot(R_, numeric.mul(I,cam_vec[i])) );
				f_low_sum = f_low_sum + cam_vec[i] * cam_vec[i];
			}
			
			x = numeric.mul(x_sum, 1.0/counter);
			f = f_up_sum / f_low_sum;
			
			//�I������
			if(prev_x == null){
				
			}else if(numeric.norm2(numeric.sub(x, prev_x))<min_err){
				break;
			}
			//�X�V����
			n_iter = n_iter + 1;
		}
		console.log(sprintf("performed %d iterations",n_iter));
		
		return {"x":x, "R":R_};
	}
}

console.log("finish load posit_est.js");