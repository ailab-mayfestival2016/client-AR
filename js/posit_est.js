console.log("load posit_est.js");

var POSITEST = POSITEST || {};

//require

//mapdataのフォーマット
//マーカーの配列　各マーカーはidとpos,mat,sizeをキーとして持つ
//id　マーカーのIDで整数
//pos　マーカーの中心の位置の絶対座標
//mat マーカーを上向きにおいたとき、右、手前、下をu,v,w軸と定義する　各列に順にu,v,wが納められた行列
//size マーカーの絶対座標におけるサイズ
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
		//マーカーの取得
		var _this = this;
		var markers = this.jsArucoMarker.detectMarkers(domElement);
		
		if(markers.length==0){
			console.log("No Marker Detected");
			return null;
		}else{
			console.log(sprintf("%d Markers Detected",markers.length));
		}
		
		//平均姿勢行列[I,J,K]
		var R_ = [[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]];
		
		//マーカーのサイズを考慮した、各マーカーからカメラへのベクトル(カメラ座標系)
		var cam_vec = []
		//マーカーの位置
		var marker_vec = []
		
		var counter = 0;
		markers.forEach(function (marker){
			var id = marker.id;
			console.log(sprintf("detect Marker ID %d",id));
			
			//想定外のマーカーなら除外
			if(!(id in _this.mat)){
				console.log("Not in map");
				return;
			}
			
			var pos = _this.jsArucoMarker.getMarkerPosition(marker);
			var rot = pos.bestRotation;
			var trans = pos.bestTranslation;
			
			console.log("rot");
		for(var i=0;i<3;i++){
			console.log(vsprintf("%.2f %.2f %.2f",rot[i]));
		}
		console.log(vsprintf("%.2f %.2f %.2f",trans));
			//平均を求めるために足し合わせていく
			var global_R = numeric.dot(_this.mat[id], numeric.transpose(rot));
			R_ = numeric.add(R_, global_R);
			
			//マーカー→カメラのベクトル（カメラ座標系）
			cam_vec.push(numeric.mul([-trans[0], -trans[1], -trans[2]], _this.size[id]));
			
			marker_vec.push(_this.pos[id]);
			
			counter = counter + 1;
		});
		
		if(counter<2){
			console.log("failed to detect more than 1 markers");
			return null; 
		}
		
		//平均姿勢行列を求める
		//reference: http://home.hiroshima-u.ac.jp/tamaki/study/20090924SIS200923.pdf
		R_ = numeric.mul(R_, 1.0/counter);
		var ret = numeric.svd(R_);
		R_ = numeric.dot(ret.U, numeric.transpose(ret.V));
		
		console.log("R_");
		for(var i=0;i<3;i++){
			console.log(vsprintf("%.2f %.2f %.2f",R_[i]));
		}
		
		//カメラの位置を推定
		var width = domElement.width;
		
		//初期値設定
		var f = 1.0;
		var A = [0.0,0.0,f]
		var x = numeric.add(marker_vec[0], numeric.dot(R_, numeric.mul(A, cam_vec[0])));
		var prev_x = null;
		
		var n_iter = 0;
		var max_iter = 100;
		var min_err = 1.0;
		while(n_iter<max_iter){
			console.log(sprintf("f %.2f",f));
			console.log(sprintf("x %.2f %.2f %.2f",x[0],x[1],x[2]));
			var A = [0.0,0.0,f];
			var I = [0.0,0.0,1.0];
			//
			var x_sum = [0.0,0.0,0.0];
			var f_up_sum = 0.0;
			var f_low_sum = 0.0;
			
			for(var i = 0; i<counter; i++){
				x_sum = numeric.add(x_sum, numeric.add(marker_vec[i], numeric.dot(R_, numeric.mul(A, cam_vec[i]))));
				f_up_sum = f_up_sum + numeric.dot( numeric.add(x,marker_vec[i]), numeric.dot(R_, numeric.mul(I,cam_vec[i])) );
				f_low_sum = f_low_sum + cam_vec[i][2] * cam_vec[i][2];
			}
			x = numeric.mul(x_sum, 1.0/counter);
			f = f_up_sum / f_low_sum;
			
			//終了処理
			if(prev_x == null){
				
			}else if(numeric.norm2(numeric.sub(x, prev_x))<min_err){
				break;
			}
			//更新処理
			n_iter = n_iter + 1;
		}
		console.log(sprintf("performed %d iterations",n_iter));
		
		return {"x":x, "R":R_, "f":f};
	}
}

console.log("finish load posit_est.js");