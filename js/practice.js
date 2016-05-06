console.log("load practice.js");

function main(){
	//�V�[���̍쐬
	var scene = new  THREE.Scene();
	//��������fov�͊p�x�H
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	//��ʃT�C�Y���ύX���ꂽ�ۂ̃C�x���g�n���h��
	function onWindowReSize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		
		camera.updateProjectionMatrix();
		
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener("resize", onWindowReSize, false);
	
	//�I�u�W�F�N�g�̍쐬
	var geometry = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	
	camera.position.z=5;
	
	var render = function(){
		requestAnimationFrame(render);
		
		renderer.render(scene, camera);
	}
	
	//Chrome�Ȃ�console.log�Ńf�o�b�O�\���ł���
	console.log("render loop start!!");
	render();
}

//AR���o�̃f�o�b�O�p�֐�
function ar_main(){
	console.log("this is debug function for ar marker");
	var jsArucoMarker = new THREEx.JsArucoMarker();
	
	var timerID = -1;
	
	//var imageGrabbing = new THREEx.ImageGrabbing("images/sample.jpg");
	var imageGrabbing = new THREEx.WebcamGrabbing();
	//var imageGrabbing = new THREEx.VideoGrabbing("videos/sample.3gp");
	
	//�摜��\��
	document.body.appendChild(imageGrabbing.domElement)
	
	var domElement	= imageGrabbing.domElement;
	
	var loop = function(){
		//�}�[�J�[�̌��o
		var markers	= jsArucoMarker.detectMarkers(domElement);
		
		if(markers.length==0){
			console.log("no detection. skipping...");
			return;
		}
	
		console.log("finish detect marker");
	
		markers.forEach(function(marker){
			console.log(sprintf("detect marker ID:%d",marker.id));
		
			//�}�[�J�[�̎����𒲂ׂ�
			/*
			for(var prop in marker){
				console.log("prop:%s",prop);
			}*/
			//id��corners�������Ă���
			
			//�}�[�J�[���W���擾
		
			//�����͉摜���ǂݍ��܂�Ă��Ȃ������肷��Ƌ�̔z���Ԃ�
			var pos = jsArucoMarker.getMarkerPosition(marker);
			
			//translation�ɂ���
			//���f���T�C�Y���傫���Ȃ��X,Y,Z�S�Ă��傫���Ȃ�
			//�œ_�������ω�����ƁA���s��(Z)�̂ݑ傫���Ȃ�
			
			//��]�s��́A�e�s�����ꂼ��J�����E�A��A�������̊��x�N�g�����}�[�J�[���W�n�i�E-��-���ʉ��j�ɂ�����
			//�\���������̂ɂȂ��Ă���
			var rot = pos.bestRotation;
			//trans�̓}�[�J�[�����̍��W
			//�������A�X�P�[���Ƃ��Ă�f��1.0�ŉ摜��������1.0�̏󋵂ŁA�}�[�J�[�̈�ӂ̒�����1.0�Ƃ����l���Ԃ��Ă��Ă���(�����������ɕύX����)
			//�l�̍��W�n�͎ʐ^�̉E-��-���s����
			var trans = pos.bestTranslation;
		
			console.log("---Rotation Matrix--");
			var i,j;
			var str = "";
			for(i=0;i<3;i++){
				for(j=0;j<3;j++){
					str = str + sprintf("%.2f ",rot[i][j]);
				}
				str = str + "\n";
			}
			console.log(str);
			console.log(sprintf("--Translation Vector--\n%.2f %.2f %.2f",trans[0],trans[1],trans[2]));
			
			//jsArucoMarker.markerToObject3D(marker, markerObject3D);
		})
		//console.log(sprintf("est timerID is %d",timerID));
		//clearInterval(timerID);
	}
	
	timerID = setInterval(loop, 500);
	console.log(sprintf("timerID is %d",timerID));
	
	console.log("end program");
}

function posest_main(){
	var map = [{"id":0, "pos":[-7.5,7.5,0.0], "mat":[[1.0,0.0,0.0], [0.0,1.0,0.0], [0.0,0.0,1.0]], "size":5.0},
		{"id":10, "pos":[7.5,7.5,0.0], "mat":[[1.0,0.0,0.0], [0.0,1.0,0.0], [0.0,0.0,1.0]], "size":5.0},
		{"id":20, "pos":[-7.5,-7.5,0.0], "mat":[[1.0,0.0,0.0], [0.0,1.0,0.0], [0.0,0.0,1.0]], "size":5.0},
		{"id":30, "pos":[7.5,-7.5,0.0], "mat":[[1.0,0.0,0.0], [0.0,1.0,0.0], [0.0,0.0,1.0]], "size":5.0},
		{"id":40, "pos":[0.0,15.2,5.5], "mat":[[1.0,0.0,0.0], [0.0,0.0,1.0], [0.0,-1.0,0.0]], "size":5.0},
		{"id":50, "pos":[15.5,0.0,5.0], "mat":[[0.0,-1.0,0.0], [0.0,0.0,1.0], [-1.0,0.0,0.0]], "size":5.0},
		{"id":60, "pos":[0.0,-14.5,5.0], "mat":[[-1.0,0.0,0.0], [0.0,0.0,1.0], [0.0,1.0,0.0]], "size":5.0},
		{"id":70, "pos":[-17.5,0.0,5.0], "mat":[[0.0,1.0,0.0], [0.0,0.0,1.0], [1.0,0.0,0.0]], "size":5.0}]
	//var imageGrabbing = new THREEx.ImageGrabbing("images/test2.jpg");
	//var imageGrabbing = new THREEx.VideoGrabbing("videos/sample.3gp");
	var imageGrabbing = new THREEx.WebcamGrabbing();
	
	//�摜��\��
	document.body.appendChild(imageGrabbing.domElement);
	
	var domElement	= imageGrabbing.domElement;
	
	var estimater = new POSITEST.positionEstimater(map);
	
	var timerID = setInterval(function (){
			var pos = estimater.est_pos(domElement);
			
			if(pos!=null){
				console.log("-----CAMERA POSITION-------")
				console.log(vsprintf("position:%5.2f, %5.2f, %5.2f",pos["x"]));
				console.log("rotation");
				for(var i=0;i<3;i++){
					console.log(vsprintf("%5.2f, %5.2f, %5.2f",pos["R"][i]));
				}
				console.log(sprintf("f %.2f",pos["f"]));
			}
		}, 1000);
}

console.log("finish load practive.js");