console.log("load practice.js");

function main(){
	//シーンの作成
	var scene = new  THREE.Scene();
	//第一引数のfovは角度？
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	//画面サイズが変更された際のイベントハンドら
	function onWindowReSize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		
		camera.updateProjectionMatrix();
		
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener("resize", onWindowReSize, false);
	
	//オブジェクトの作成
	var geometry = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	
	camera.position.z=5;
	
	var render = function(){
		requestAnimationFrame(render);
		
		renderer.render(scene, camera);
	}
	
	//Chromeならconsole.logでデバッグ表示できる
	console.log("render loop start!!");
	render();
}

//AR検出のデバッグ用関数
function ar_main(){
	console.log("this is debug function for ar marker");
	var jsArucoMarker = new THREEx.JsArucoMarker();
	
	var timerID = -1;
	
	//var imageGrabbing = new THREEx.ImageGrabbing("images/sample.jpg");
	//var imageGrabbing = new THREEx.WebcamGrabbing();
	var imageGrabbing = new THREEx.VideoGrabbing("videos/sample.3gp");
	
	//画像を表示
	document.body.appendChild(imageGrabbing.domElement)
	
	var domElement	= imageGrabbing.domElement;
	
	var loop = function(){
		//マーカーの検出
		var markers	= jsArucoMarker.detectMarkers(domElement);
		
		if(markers.length==0){
			console.log("no detection. skipping...");
			return;
		}
	
		console.log("finish detect marker");
	
		markers.forEach(function(marker){
			console.log(sprintf("detect marker ID:%d",marker.id));
		
			//マーカーの持つ情報を調べる
			/*
			for(var prop in marker){
				console.log("prop:%s",prop);
			}*/
			//idとcornersを持っていた
			
			//マーカー座標を取得
		
			//こいつは画像が読み込まれていなかったりすると空の配列を返す
			var pos = jsArucoMarker.getMarkerPosition(marker);
			
			//translationについて
			//モデルサイズが大きくなるとX,Y,Z全てが大きくなる
			//焦点距離が変化すると、奥行き(Z)のみ大きくなる
			
			//回転行列は、各行がそれぞれカメラ右、上、奥方向の基底ベクトルをマーカー座標系（右-上-紙面奥）において
			//表現したものになっている
			var rot = pos.bestRotation;
			//transはマーカー中央の座標
			//ただし、スケールとしてはfが1.0で画像横長さが1.0の状況で、マーカーの一辺の長さを1.0とした値が返ってきている(そういう風に変更した)
			//値の座標系は写真の右-上-奥行方向
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
	var map = [
			{
				"id":110,
				"pos":[7.45,-2.25,0.0],
				"mat":[[1.0,0.0,0.0], [0.0,1.0,0.0],[0.0,0.0,1.0]],
				"size":4.5
			},
			{
				"id":47,
				"pos":[2.25,-2.25,0.0],
				"mat":[[1.0,0.0,0.0], [0.0,1.0,0.0],[0.0,0.0,1.0]],
				"size":4.5
			},
			{
				"id":88,
				"pos":[2.25,-7.45,0.0],
				"mat":[[1.0,0.0,0.0], [0.0,1.0,0.0],[0.0,0.0,1.0]],
				"size":4.5
			},
			{
				//"id":576,
				"id":265,
				"pos":[7.45,-7.45,0.0],
				"mat":[[1.0,0.0,0.0], [0.0,1.0,0.0],[0.0,0.0,1.0]],
				"size":4.5
			}
		];
	
	var imageGrabbing = new THREEx.ImageGrabbing("images/test2.jpg");
	//var imageGrabbing = new THREEx.VideoGrabbing("videos/sample.3gp");
	
	//画像を表示
	document.body.appendChild(imageGrabbing.domElement);
	
	var domElement	= imageGrabbing.domElement;
	
	var estimater = new POSITEST.positionEstimater(map);
	
	var timerID = setInterval(function (){
			var pos = estimater.est_pos(domElement);
			if(!(pos==null)){
				clearInterval(timerID);
			}
		}, 1000);
}

console.log("finish load practive.js");