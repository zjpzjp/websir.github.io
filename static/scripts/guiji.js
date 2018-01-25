
window.GuiJi = {
    map: null,//地图对象
    updateCar: function () { },//地图中更新车辆信息
    nextData: function () { },
    data: [],
    init: function () { },
    carMarker: {},//车辆得Marker实例
    play: function () { },
    pluse: function () { },
    renderLine: function () { },
    infoWindow: $("<div></div>"),
    currentIndex: 0,//当前播放第几条数据
    clearAll: function () { }

};
!(function () {
    var map = new BMap.Map('Bmap');
    map.centerAndZoom(new BMap.Point(116.726509, 39.53446), 5);
    map.enableScrollWheelZoom(true);

    var statusImgs = {
        online: "/static/images/online.png",
        offline: "/static/images/offline.png",
        warning: "/static/images/warning.png"
    }

    GuiJi.map = map;


    GuiJi.init = function (data) {
        GuiJi.clearAll();
        GuiJi.data = data;
        GuiJi.renderLine(data);

    }

    GuiJi.clearAll = function () {
        GuiJi.data = null;
        GuiJi.map.clearOverlays();
        GuiJi.currentIndex = 0;
    }

    GuiJi.renderLine = function (data) { //data = []
        var polylines = [];//原始坐标点集合
        var polylinesPromise = []; // 坐标点Promise集合｛百度地图批量转换坐标最多100个每次｝
        var convertor = new BMap.Convertor();
        var polylinesMap = [];//记录每个原始坐标在数据中得位置； 用于排除错误坐标
        data.map(function (item,i) {
            if (parseInt(item.Lon) != 0 && parseInt(item.Lat) != "0") {
                polylines.push(item.Lon + "," + item.Lat);
                polylinesMap.push(i);
            } else {
                //polylines.push("0.1,0.1")
            }
        });
       
        for (var i = 0, len = Math.ceil(polylines.length / 100); i < len; i++) {
            var a = new Promise(function (resolve, reject) {
                $.ajax({
                    url: "http://api.map.baidu.com/geoconv/v1/",
                    jsonp: "callback",
                    dataType: "jsonp",
                    data: {
                        coords: polylines.slice(i * 100, (i + 1) * 100).join(";"),
                        from: 1,
                        to: 5,
                        ak: "C7kiRgh3qZDHrCbpf9vVGjrN3O9Rf10Q"
                    },
                    success: function (data) {
                        resolve(data)
                    }
                });
            });
            polylinesPromise.push(a);

        }


        Promise.all(polylinesPromise).then(function (points) {
            var linePoints = []; //转换后的坐标集合
            points.map(function (item) {
                item.result.map(function (position){
                    linePoints.push(new BMap.Point(position.x, position.y));
                })
            });
            linePoints.map(function (item, index) { // 更新原始Data
                
                GuiJi.data[polylinesMap[index]].Lon = item.lng;
                GuiJi.data[polylinesMap[index]].Lat = item.lat;
            });
            
            var polyline = new BMap.Polyline(linePoints, { strokeColor: "blue", strokeWeight: 5, strokeOpacity: 0.5 });
            GuiJi.map.addOverlay(polyline);   //增加折线
            GuiJi.map.setViewport(linePoints); //缩放地图
            GuiJi.addCar(GuiJi.data[0]);//添加车辆到起始位置
        })
    }


    GuiJi.addCar = function (data) {
        var point = new BMap.Point(data.Lon, data.Lat);
        GuiJi.carMarker = new BMap.Marker(point, {
            icon: new BMap.Icon(statusImgs["online"], new BMap.Size("32", "32"))
        });
        var label = new BMap.Label(data.License, { position: point, offset: new BMap.Size(50, -1) });
        GuiJi.carMarker.setZIndex(1);
        label.setStyle({ border: "none", background: "none" });
        label.setContent('\
          <div style="background:#FFF;border-radius:5px; fot-size:15px;padding:2px 5px; border:1px solid #007ed2; color:#007ed2;">\
            <div style="position:absolute;left:-38px;top:10px; width:39px; border-bottom:1px solid #007ed2;"></div>\
          '+ data.License + '\
          </div>');
        GuiJi.infoWindow = new BMap.InfoWindow(createInfoWindow(data), { width: 350, height: 240 });
        GuiJi.carMarker.addEventListener("click", function () {
            
            this.openInfoWindow(GuiJi.infoWindow); //开启信息窗口
        });
        GuiJi.carMarker.setLabel(label);
        map.addOverlay(GuiJi.carMarker);

    }


    GuiJi.updateCar = function (data) { //更新车辆位置
        //GuiJi.infoWindow.setContent("" + GuiJi.currentIndex);
        if (GuiJi.infoWindow && GuiJi.infoWindow.map) { 
            GuiJi.infoWindow.map.Cb.og.innerHTML = createInfoWindow(data)
        }
        
        var pt = new BMap.Point(data.Lon, data.Lat);
        if (data.Alarm > 0) {
            var icon = new BMap.Icon(statusImgs["warning"], new BMap.Size("30", "30"));
            GuiJi.carMarker.setIcon(icon)
        }
        ;
        GuiJi.carMarker.setPosition(pt);
        //GuiJi.map.setViewport({ center: pt, zoom: GuiJi.map.getZoom() })
       


    }

    GuiJi.nextData = function () {
        var max = GuiJi.data.length-1;
        if (max > GuiJi.currentIndex) {
            GuiJi.currentIndex += 1;
            if (parseInt(GuiJi.data[GuiJi.currentIndex].Lat) != 0 && parseInt(GuiJi.data[GuiJi.currentIndex].Lon) != 0) {  //跳过不正确得经纬度
                GuiJi.updateCar(GuiJi.data[GuiJi.currentIndex]);
            }
            return GuiJi.currentIndex;
        } else {
            return false;
        }

    }


    function createInfoWindow(data) {

        var html = "\
<div class='map-infowindow'>\
    <div><strong>车&#x3000;牌：</strong>"+ (data.License || "--") + "</div>\
    <div><strong>联系人：</strong>"+ (data.LinkMan || "--") + "</div>\
    <div><strong>电&#x3000;话：</strong>"+ (data.Tel || "--") + "</div>\
    <div><strong>车&#x3000;速：</strong>"+ (data.GPSSpeed || "--") + "</div>\
    <div><strong>里&#x3000;程：</strong>"+ (data.x01 || "--") + "</div>\
    <div><strong>报&#x3000;警：</strong>"+ (UI.getAlarm(data.Alarm) || "--") + "</div>\
    <div><strong>时&#x3000;间：</strong>"+ (data.Time || "--") + "</div>\
    <div><strong>位&#x3000;置：</strong>"+ (data.Address || "--") + "</div>\
</div>";

        return html;

    }



})();