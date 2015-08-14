/*!
 * Collapsible, jQuery Plugin
 * jquery.smartList-1.3.js 
 *
 * Copyright (c) 2014
 * author: Bian Kaiming (Walle)
 * @ version: 1.3.1
 *
 * Date: Sun Mar 9 14:14:22 2014
 */

;(function($){
	$.fn.searchList = function(options){
		var defaultVal = {
				clickResponse:false, 			//点击文本框是否响应，默认为false，不响应
				listNum	: 0,					//下拉列表显示条数限制，0为所有
				listMaxHeight : 0,				//下拉列表最大高度限制，0为不限制
				listMaxWidth : "small",			//列表最大宽度，可选值small,middle,large
				listBgColor : "#ffffff",		//列表背景颜色
				listMouseOver : "#efefef",		//鼠标移动高亮显示行颜色
				listBorderColor : "#cccccc",	//列表框边框颜色
				cursor : "default",				//鼠标形状default，pointer
				inputMatch : true,				//是否输入匹配值，默认为true，匹配
				matchTextColor : "#1D8EC7",		//匹配字颜色显示，默认蓝色
				notFindText : "无显示结果...",	//未找到搜索信息显示文字
				notFindTextColor : "#E03D22",	//未找到搜索信息显示文字颜色
				content :["error"],				//列表内容，json数据，原设为两种可选,一种是有标题的，需要解析两个值groupName和groupChild，一种是无标题的直接填入数组值即可，如["a","b","c"]
				//loading:false					//是否显示loading界面  暂时开启功能
				onSelected:function(obj){}
		};
		
		var options = $.extend(defaultVal, options);
		
		return this.each(function(){
				var self = $(this);
				var inputMark;//取自身对象标记
				if($(self).attr("id") != undefined){
					inputMark = $(self).attr("id");
				}else if($(self).attr("class") != undefined){
					inputMark = $(self).attr("class");
				};

				//获取文本框长度和高度
				var inputW = $(this).width();
				var inputH = $(this).height();
				
				//初始化结构函数
				var init = function(w, h){
					//设置宽度
					var listMaxWidthNum;
					switch(options.listMaxWidth){
						case "small" :
						listMaxWidthNum = w+3;
						break;
						case "middle" :
						listMaxWidthNum = w+23;
						break;
						case "large" :
						listMaxWidthNum = w+43;
						break;
					};
					//创建结构
					$("<div class=\"dropDownList\"><div class=\"dropDatas\"></div></div>").appendTo("body");
					$(".dropDownList").hide();
					if(parseInt(options.listMaxHeight) != 0){
						$(".dropDownList").css({"max-height":options.listMaxHeight,"overflow-y":"auto"});
					};
					$(".dropDatas").live("mouseover",function(){$(this).children("div").siblings().removeClass("active");}).live("mouseout",function(){$(this).children("div:first").addClass("active");});
					$("<style type=\"text\/css\">"+
						  ".dropDownList{width:"+listMaxWidthNum+"px;background-color:"+options.listBgColor+"; border-width:1px; border-style:solid; border-color:"+options.listBorderColor+";position:absolute;z-index:9999;}"+
						  ".dropDatas>div{background:"+options.listBgColor+";height:"+(h+5)+"px;line-height:"+(h+5)+"px;cursor:"+options.cursor+";}"+
						  ".dropDatas>div:hover{background:"+options.listMouseOver+";}"+
						  ".dropDatas>div.active{background:"+options.listMouseOver+";}"+
						  ".dropDatas>label{font-weight:700;height:"+(h+5)+"px;line-height:"+(h+5)+"px;display:block;}"+
						  ".dropDatas>div>b{color:"+options.matchTextColor+";}"+
					  "</style>").appendTo("head");
				};
				
				//获得文本框触发下拉事件
				var onFocusInput = function(w, h){
						$(self).focus(function(){
							if($(".dropDownList:hidden").length == 0){
								return false;
							}else{
								$(".dropDownList").show();
								//写入信息
								findMsg(w, h, $(this).val());
							};
							//点击空白处消失
							$(document).bind("click",function(e){
								var target = $(e.target); 
								if((target.closest(self).length == 0)&&(target.closest(".dropDownList label").length == 0)){
									$(".dropDownList").hide().children().empty();
								};
								e.stopPropagation();
							});
						});
						//绑定单击选中事件
						$(".dropDatas>div").live("click",function(){
							$(self).attr("value",$(this).text());
							var groupIndex=$(this).prevAll("label").attr("index");
							var groupChildIndex = $(this).attr("index");
							var obj = options.content[groupIndex].groupChild[groupChildIndex];
							options.onSelected(obj);
						});
				};
				
				//键入文本框搜索内容事件
				var onKeyUpRun = function(w, h){
					$(self).keyup(function(e){
						//筛选信息
						if(e.keyCode == 13){
							$(self).attr("value",$(".dropDatas>div.active:visible").text());
							$(".dropDownList").hide().children().empty();
						}else if(e.keyCode == 40){
							if($(".dropDatas>div.active").next("div")){
								$(".dropDatas>div.active").next("div").addClass("active").end().removeClass("active");
							}else if($(".dropDatas>div.active").next("label")){
								$(".dropDatas>div.active").next("label").next("div").addClass("active").end().removeClass("active");
							}
						}else{
							findMsg(w, h, $(this).val());
							if($(self).val() != null){
								var groupIndex=$(".dropDatas>div.active").prevAll("label").attr("index");
								var groupChildIndex = $(".dropDatas>div.active").attr("index");
								var obj = options.content[groupIndex].groupChild[groupChildIndex];//alert(1);
								options.onSelected(obj);
							}
							$(".dropDownList").show();
						};
					});
				};
				
				//执行查找插入函数
				var findMsg = function(w, h, str){
					var inputVal = str;//获取文本框内的值
					var iStore = -1;//存储i值
					var piece = 0;//搜索条数计数器
					var pattern = new RegExp("^"+inputVal,"ig");//创建一个匹配输入内容的正则表达式
					//进行内容匹配
					$(".dropDatas").empty();//清空原有信息
					//写入信息
					if(options.content.length != 0){
						var listH;
						if((options.listNum != 0)&&(options.content.length > options.listNum)){
							listH = options.listNum;
						}else{
							listH = options.content.length;
						};
						for(var i = 0; i < listH; i++){
							if(options.content[i].groupChild){
								//解析json内的子节点
								for(var j = 0; j < options.content[i].groupChild.length; j++){
									var childVal = options.content[i].groupChild[j].text;//console.log(childVal);
									if(pattern.test(childVal)){
										if(iStore != i){//本属性组内第一次匹配成功判断，如果成功，添加组名称
											$("<label index=\""+i+"\">"+options.content[i].groupName+"</label>").appendTo($(".dropDatas"));
											iStore = i;
										};
										childVal = childVal.replace(inputVal,"<b>"+inputVal+"</b>");//令匹配的数据加粗显示
										$("<div index=\""+j+"\">"+childVal+"</div>").appendTo($(".dropDatas"));
										if(inputVal != ""){
											$(".dropDatas>div:first").addClass("active");
										}else{
											$(".dropDatas>div:first").removeClass("active");
										};
										piece++;
									};
									pattern.lastIndex = 0;
								};
							}else{
								//解析数组内容
								var arrVal = options.content[i];
								if(pattern.test(arrVal)){
									arrVal = arrVal.replace(inputVal,"<b>"+inputVal+"</b>");//令匹配的数据加粗显示
									$("<div index=\""+i+"\">"+arrVal+"</div>").appendTo($(self).next().children(".dropDatas"));
									piece++;
								};
								pattern.lastIndex = 0;
							};
						};
						if(piece == 0){$("<label style=\"color:"+ options.notFindTextColor +";\">"+options.notFindText+"</label>").appendTo($(".dropDatas"));};
					};
					if(options.content[0].groupChild){
						$(".dropDatas>div").css({"padding-left":"15px"});
						$(".dropDatas>label").css({"padding-left":"5px"});
					}else{
						$(".dropDatas>div").css({"padding-left":"5px"});
					};
					//排布位置
					$(".dropDownList").css({"top":$(self).offset().top+inputH+8+"px","left":$(self).offset().left+"px"});
				};
				
				//初始化执行
				init(inputW, inputH);
				//执行文本框触发下拉事件
				if(options.clickResponse == true){
					onFocusInput(inputW, inputH);
				}else{
					return false;
				};
				//执行键入文本框搜索内容事件
				onKeyUpRun(inputW, inputH);
				
		});
		
	};
})(jQuery);
