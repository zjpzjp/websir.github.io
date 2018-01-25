
/*
*参数说明
* CarId = SimId 或者任意唯一得ID
* data = Object 一个js对象 格式如下（必须包含以下字段）
*    {
        License: treeNode.name,
        SimId: treeNode.id,
        Time: treeNode.Time,
        Alarm: treeNode.Alarm,//报警标识位
        Status: treeNode.Status, //状态位 ?
        Lon: treeNode.Lon, //经度
        Lat: treeNode.Lat, //纬度
        GPSSpeed: treeNode.GPSSpeed, //速度
        Direction: treeNode.Direction, //方向
        x01: treeNode.x01 //总里程
 *   }
*/
window.BeiDouMap = {
    map: null,//地图对象
    addCar: function (CarId, data) { },//地图中添加
    positionCar: function (CarId) { },//定位车辆
    removeCar: function (CarId) { },//地图中删除车辆
    updateCar: function (CarId, data) { },//地图中更新车辆信息
    carList: {},//地图中所有车辆的集合
    currentCar: null //当前打开信息窗口得车辆
};
!(function () {
    var map = new BMap.Map('Bmap');
    var statusImgs = {
        online: "/static/images/online.png",
        offline: "/static/images/offline.png",
        warning:"/static/images/warning.png"
    }
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 5);
    map.enableScrollWheelZoom(true);
    function Car() {
        this.data = null;
    }
    Car.prototype.update = function (data) {

        var that = this;


        //判断GPS时间是否比当前数据得时间新
        if (new Date(data.Time) < new Date(this.Time)) {
            return false;
        }


        



        //判断2次经纬度是否有变化，如果有就更新地址信息
        if (data.Lon != this.data.Lon || data.Lat != this.data.Lat) {
            $.ajax({
                url: "http://api.map.baidu.com/geocoder/v2/?output=json&ak=E6CTjsauEoavEzCYG4WM1zt0S5OB6dAf",
                data: { location: this.data.Lat + "," + this.data.Lon },
                dataType: "jsonp",
                success: function (Sdata) {
                    data.Address = Sdata.result.formatted_address + Sdata.result.sematic_description;
                    renderCar();
                    if (mapTable) {
                        data.Position = data.Address;
                        mapTable.update(data);
                    }
                }
            })
        } else {
            renderCar();
        }



        function renderCar() {
            that.data = data;
            if (that.status != "online") {//更新车辆为在线
                that.updateStatus("online");
            }
            if (that.data.Alarm != "0") { //判断是否报警
                that.updateStatus("warning");
            } else {
                that.updateStatus("online");
            }

            var marker = that.marker;
            if (marker) {//更新车辆位置
                var convertor = new BMap.Convertor();
                var pointArr = [];
                pointArr.push(new BMap.Point(data.Lon, data.Lat));
                convertor.translate(pointArr, 1, 5, function (item) {
                    marker.setPosition(item.points[0]);
                    marker.setRotation(data.Direction);
                })
            }

            if (BeiDouMap.currentCar && data.SimId == BeiDouMap.currentCar.data.SimId) { //更新当前打开的infoWindow信息
                BeiDouMap.infoWindow.map.Cb.og.innerHTML = createInfoWindow(data)
                //BeiDouMap.infoWindow.setContent(createInfoWindow(data))
            }


        }

    }
    Car.prototype.updateStatus = function (status) {
        //status online上线 offline离线  warning报警
        this.status = status;
        var icon = new BMap.Icon(statusImgs[status], new BMap.Size("30", "30"));
        this.marker.setIcon(icon);
        if (status == "offline") { 
            this.label.setContent('\
              <div style="background:#FFF;border-radius:5px;margin-top:5px; font-size:15px;padding:2px 5px; border:1px solid #999; color:#666;">\
                <div style="position:absolute;left:-38px;top:15px;*top:0; width:39px; border-bottom:1px solid #999;"></div>\
              '+ (this.data.License || "--") + '\
              </div>');
        }

        if (status == "online") {
            this.label.setContent('\
              <div style="background:#FFF;border-radius:5px;margin-top:5px; font-size:15px;padding:2px 5px; border:1px solid #007ed2; color:#007ed2;">\
                <div style="position:absolute;left:-38px;top:15px;*top:0; width:39px; border-bottom:1px solid #007ed2;"></div>\
              '+ (this.data.License || "--") + '\
              </div>');
        }

        if (status == "warning") {
            this.label.setContent('\
              <div style="background:#FFF;border-radius:5px;margin-top:5px; font-size:15px;padding:2px 5px; border:1px solid red; color:red;">\
                <div style="position:absolute;left:-38px;top:15px;*top:0; width:39px; border-bottom:1px solid red;"></div>\
              '+ (this.data.License || "--") + '\
              </div>');
        }

    }


    BeiDouMap = {
        map: map,
        carList: {

        },
        infoWindow: null,
        positionCar: function (carId) {

            var car = BeiDouMap.carList[carId];

            if (car) {
                var point = new BMap.Point(car.data.Lon, car.data.Lat);
                //BeiDouMap.map.panTo(point);
                setTimeout(function () {
                    BeiDouMap.map.panTo(point);
                }, 0)
                //BeiDouMap.map.centerAndZoom(point);
            }


        },
        offlineCar: function (CarId) {
            var _car = BeiDouMap.carList[CarId];
            if (_car) {
                _car.updateStatus("offline");
            }
        },
        openInfoWindow: function (CarId) {
            var _car = BeiDouMap.carList[CarId];
            if (_car){
                BeiDouMap.currentCar = _car;
                BeiDouMap.infoWindow = new BMap.InfoWindow(createInfoWindow(_car.data), { width: 350 });
                _car.marker.openInfoWindow(BeiDouMap.infoWindow); //开启信息窗口
            }
        },
        addCar: function (CarId, data) {


            if (BeiDouMap.carList[CarId] && BeiDouMap.carList[CarId].marker) {
                map.removeOverlay(BeiDouMap.carList[CarId].marker);
            }
            var _car = BeiDouMap.carList[CarId] = new Car();
            _car.data = data;




            var point = new BMap.Point(data.Lon, data.Lat);
            _car.marker = new BMap.Marker(point, {
                icon: new BMap.Icon(statusImgs["online"], new BMap.Size("32","32"))});
            _car.marker.setZIndex(99999);
            _car.label = new BMap.Label(CarId, { position: point, offset: new BMap.Size(50, -1) });

            _car.label.setStyle({ border: "none", background: "none" });
            _car. label.setContent('\
          <div style="background:#FFF;border-radius:5px;margin-top:5px; font-size:15px;padding:2px 5px; border:1px solid #007ed2; color:#007ed2;">\
            <div style="position:absolute;left:-38px;top:15px;*top:0; width:39px; border-bottom:1px solid #007ed2;"></div>\
          '+ (data.License||"--") + '\
          </div>');

            _car.marker.addEventListener("click", function () {
                BeiDouMap.currentCar = _car;
                BeiDouMap.infoWindow = new BMap.InfoWindow(createInfoWindow(BeiDouMap.carList[data.SimId].data), { width: 350, height: 240 });
                this.openInfoWindow(BeiDouMap.infoWindow); //开启信息窗口
            });
            _car.marker.setLabel(_car.label);
            map.addOverlay(_car.marker);
            BeiDouMap.positionCar(CarId);
            return true;
        },

        removeCar: function (CarId) {
            if (BeiDouMap.carList[CarId] && BeiDouMap.carList[CarId].marker) {
                map.removeOverlay(BeiDouMap.carList[CarId].marker);
                delete BeiDouMap.carList[CarId];
                return true;
            }
            return false;
        },

        updateCar: function (CarId, data) {
            //如果没有该车、就创建,并加入到carList
            if (!BeiDouMap.carList[CarId]) {
                return false;
            }
            BeiDouMap.carList[CarId].update(data);

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