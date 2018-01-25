/**
 * 全国平台验证规则
 * 移植入layui验证
 */
;(function () { 
var validateKCPT = function () {

};
validateKCPT.prototype = {
    //电话号码
    phonenumber: function (value, element) {
        var reg = "^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$";
        var r = value.match(new RegExp(reg));
        if (r == null) return false;
        return true;
    },
    //电话号码带分机号
    phonenumberlong: function (value, element, param) {
        var reg = "^(([0\+]\\d{2,3}-)?(0\\d{2,3})-)(\\d{7,8})(-(\\d{3,}))?$";
        var r = value.match(new RegExp(reg));
        if (r == null) return false;
        return true;
    },
    //邮编
    zipcode: function (value, element) {
        var reg = "^\\d{6}$";
        var r = value.match(new RegExp(reg));
        if (r == null) return false;
        return true;
    },
    //固定电话--手机号
    mobilePhoneNum: function (value, element) {
        //return /(^(\d{3,4}-)?\d{7,8})$|(13[0-9]{9})/.test(value);
        return /(^(\d{3,4}-)?\d{7,8})$|(1[0-9]{10})/.test(value);
    },
    //手机号
    mobile: function (value, element) {
        //	var reg="^(13|15|18|16)[0-9]{9}$";
        /* 允许用户录入号段：13x(0-9)、14x(0-9)、15x(0-9)、17x(0-9)、18x(0-9)、64x(0-9) */
        var reg = "^0?(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9]|64[0-9])[0-9]{8}$";
        var r = value.match(new RegExp(reg));
        if (r == null) return false;
        return true;
    },
    //邮编
    emailExtend: function (value, element) {
        var reg = "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$";
        var r = value.match(new RegExp(reg));
        if (r == null) return false;
        return true;
    },
    //判断身份证
    isidcardno: function (num, element) {
        try {
            function isDate6(sDate) {
                if (!/^[0-9]{6}$/.test(sDate)) {
                    return false;
                }
                var year, month, day;
                year = sDate.substring(0, 2);
                month = sDate.substring(2, 4);
                day = sDate.substring(4, 6);
                var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                    iaMonthDays[1] = 29;
                if (month < 1 || month > 12)
                    return false;
                if (day < 1 || day > iaMonthDays[month - 1])
                    return false;
                return true;
            }
            function isDate8(sDate) {
                if (!/^[0-9]{8}$/.test(sDate)) {
                    return false;
                }
                var year, month, day;
                year = sDate.substring(0, 4);
                month = sDate.substring(4, 6);
                day = sDate.substring(6, 8);
                var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (year < 1900 || year > 2100)
                    return false;
                if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                    iaMonthDays[1] = 29;
                if (month < 1 || month > 12)
                    return false;
                if (day < 1 || day > iaMonthDays[month - 1])
                    return false;
                return true;
            }
            var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
            var varArray = new Array();
            var intValue;
            var lngProduct = 0;
            var intCheckDigit;
            var intStrLen = num.length;
            var idNumber = num;
            if ((intStrLen != 15) && (intStrLen != 18)) {
                return false;
            }
            for (i = 0; i < intStrLen; i++) {
                varArray[i] = idNumber.charAt(i);
                if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                    return false;
                }
                else
                    if (i < 17) {
                        varArray[i] = varArray[i] * factorArr[i];
                    }
            }
            if (intStrLen == 18) {
                var date8 = idNumber.substring(6, 14);
                if (isDate8(date8) == false) {
                    return false;
                }
                for (i = 0; i < 17; i++) {
                    lngProduct = lngProduct + varArray[i];
                }
                intCheckDigit = 12 - lngProduct % 11;
                switch (intCheckDigit) {
                    case 10:
                        intCheckDigit = 'X';
                        break;
                    case 11:
                        intCheckDigit = 0;
                        break;
                    case 12:
                        intCheckDigit = 1;
                        break;
                }
                if (idNumber.charAt(17).toUpperCase() != intCheckDigit) {
                    return false;
                }

            }
            else {
                var date6 = idNumber.substring(6, 12);
                if (isDate6(date6) == false) {
                    return false;
                }
            }

        } catch (e) {

        }
        return true;
    },
    //特殊字符验证
    specialchars: function (value, element, param) {
        return /^[\u4e00-\u9fa5\w（）\-—\/()]+$/.test(value);
    }
};

    var validatekcpt = new validateKCPT();
    // 字符验证
    UI.importQGPT("specialchars", validatekcpt.specialchars, "不能含特殊符号");
    // 电话号码
    UI.importQGPT("phonenumber", validatekcpt.phonenumber, "无效电话号码");
    // 电话邮编
    UI.importQGPT("zipcode", validatekcpt.zipcode, "无效邮编");
    // 手机号码
    UI.importQGPT("mobile", validatekcpt.mobile, "无效手机号");
    // 身份证号
    UI.importQGPT("isidcardno", validatekcpt.isidcardno, "无效身份证号");
    //电子邮件地址
    UI.importQGPT("emailExtend", validatekcpt.emailExtend, "无效邮箱");

    // 身份证号
    UI.importQGPT("mobilePhoneNum", validatekcpt.mobilePhoneNum, "无效联系电话");

    // 验证汉字
    UI.importQGPT("noChinese", function (value, element) {
        var noChinese = /^[^\u4E00-\u9FA5\uF900-\uFA2D]+$/;///^-?\d+(\.\d{1,2})?$/;///[\u4E00-\u9FA5\uF900-\uFA2D]/
        return (noChinese.test(value));
    }, "不能包含汉字");
    // 验证非负整数
    UI.importQGPT("intNumber", function (value, element) {
        var intNumber = /^\d+$/;
        return (intNumber.test(value));
    }, "请输入正确数字");
    // 不能含特殊符号，需要支持输入：“.”（点号）和“-”（短横杠）；
    UI.importQGPT("specialcharsForTerminal", function (value, element) {
        var specialcharsForTerminal = /^[\u4e00-\u9fa5\w\.\-]+$/;
        return (specialcharsForTerminal.test(value));
    }, "不含特殊符号除(. -)");
    // 验证值小数位数不能超过两位 
    UI.importQGPT("decimal", function (value, element) {
        var decimal = /^-?\d+(\.\d{1,2})?$/;
        return (decimal.test(value));
    }, "请输入不超过两位小数的数字");
    UI.importQGPT("positiveDecimal", function (value, element) {
        var decimal = /^[\d]{4,10}(\.[\d]{1,2})?$/;
        return (decimal.test(value) && value >= 1000);
    }, "请输入大于1000，小数部分最多两位的数字");
    // 验证只能输入数字和字母
    UI.importQGPT("letterOrNumber", function (value, element) {
        var businessCode = /^[a-zA-Z0-9]+$/;
        return (businessCode.test(value));
    }, "只能输入数字或字母");
    // 验证只能输入数字和字母 短横线 -
    UI.importQGPT("letterNumberOrLine", function (value, element) {
        var businessCode = /^[-a-zA-Z0-9]+$/;
        return (businessCode.test(value));
    }, "只能输入数字或字母或横线");
    //验证密码
    UI.importQGPT("passWord", function (value, element) {
        var passWord = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,14}$/;
        return (passWord.test(value));
    }, "密码为8-14位，字母与数字的组合");
    //车辆型号验证特殊字符
    UI.importQGPT("specialchars2", function (value, element) {
        var specialchars2 = /^[\u4e00-\u9fa5\w、‘’：，（）\-—\/:,() ]+$/;
        return (specialchars2.test(value));
    }, "不能包含特殊字符");

    //汉字、不可输入除（）空格以外的特殊字符
    UI.importQGPT("specialChineseChars", function (value, element) {
        var specialChineseChars = /^[\u4e00-\u9fa5（） ]+$/;
        return (specialChineseChars.test(value));
    }, "只能输入汉字、空格、（）符号");

    //汉字、不可输入除 - （）空格以外的特殊字符
    UI.importQGPT("specialChineseChars1", function (value, element) {
        var specialChineseChars1 = /^[a-zA-Z\u4e00-\u9fa5()（）\-\－ ]+$/;
        return (specialChineseChars1.test(value));
    }, "只能输入汉字、英文、空格、－（）符号");
	/**
	 * 车牌号限定：字母自动转大写 或符合车架号规则
	 * 		1.第一位是汉字，后面六位由数字或字母组成，例如：京A00005
	 * 		2.前两位是汉字，后面五位由数字或字母组成，例如：津港A0007
	 * 		3.第一位是汉字，后面五位由数字或字母组成，最后一位是汉字，例如：鲁D5511挂
	 */
    UI.importQGPT("vehicleNo", function (value, element) {
        var vehicleNo01 = /^[\u4e00-\u9fa5]{1}[A-Za-z0-9]{6}$/;
        var vehicleNo02 = /^[\u4e00-\u9fa5]{2}[A-Za-z0-9]{5}$/;
        var vehicleNo03 = /^[\u4e00-\u9fa5]{1}[A-Za-z0-9]{5}[\u4e00-\u9fa5]{1}$/;
        var vehicleNo2 = /^[-A-Za-z0-9]{8}$/;
        var vehicleNo3 = /^[-A-Za-z0-9]{17}$/;
        var vehicleNo4 = /^[-A-Za-z0-9]{18}$/;
        var result = vehicleNo01.test(value) || vehicleNo02.test(value) || vehicleNo03.test(value) 
        return (result || vehicleNo2.test(element.value) || vehicleNo3.test(element.value) || vehicleNo4.test(element.value));
    }, "请输入正确车牌号");

	/**
	 * 符合车牌号的规则，判断首位汉字是否是与所在省一致
	 */
    UI.importQGPT("vehicleNo_first", function (value, element) {
        var vehicleNo01 = /^[\u4e00-\u9fa5]{1}[A-Za-z0-9]{6}$/;
        var vehicleNo02 = /^[\u4e00-\u9fa5]{2}[A-Za-z0-9]{5}$/;
        var vehicleNo03 = /^[\u4e00-\u9fa5]{1}[A-Za-z0-9]{5}[\u4e00-\u9fa5]{1}$/;
        var result = vehicleNo01.test(value) || vehicleNo02.test(value) || vehicleNo03.test(value);
        if (result) {
            if (element.value.length > 1 && element.value.substring(0, 1) != KCPT.shortName) {
                return false;
            }
        }
        return true;
    }, "车牌号首位与所在省不一致");

    //轴数限定：最小数值为2，最大为20的整数数字
    UI.importQGPT("vehicleAxis", function (value, element) {
        var vehicleAxis = /^[1-9][\d]{0,1}$/;
        return value == "" || (vehicleAxis.test(value) && value >= 2 && value <= 20);
    }, "请输入2到20的整数数字");

    //轮胎数限定：最小数值为4，最长不大于两位的整数数字。只能为偶数
    UI.importQGPT("vehicleTyreNumber", function (value, element) {
        var vehicleTyreNumber = /^[1-9][\d]{0,1}$/;
        return value == "" || (vehicleTyreNumber.test(value) && value >= 4 && value < 100 && value % 2 == 0);
    }, "请输入4到98的整偶数数字");

    //轮胎规格：字母，数字，空格，/，英文句号，-任意组合，最长不超过20位
    UI.importQGPT("vehicleTyreSize", function (value, element) {
        var vehicleTyreSize = /^[A-Za-z0-9 \/\-\.]{0,20}$/;
        return vehicleTyreSize.test(value);
    }, "只能输入字母、数字、/、-、.、空格");
    //车辆总质量（数字类型，大于1000，或者  0,--,/,－－
    UI.importQGPT("positiveDecimalTon", function (value, element) {
        var decimal = /^[\d]{4,10}(\.[\d]{1,2})?$/;
        return (decimal.test(value) && value >= 1000) || value == "0"
            || value == "--" || value == "/" || value == "－－";
    }, "请输入0、--、－－、/或大于1000且最多两位小数的数字");
    //车辆型号特殊字符验证
    UI.importQGPT("specialcharsForProdCode", function (value, element) {
        var prodCode = /^[\u4e00-\u9fa5（）()_—\-A-Za-z0-9]+$/;
        return prodCode.test(value);
    }, "只可输入()（）—_-字母、汉字、数字");

}());