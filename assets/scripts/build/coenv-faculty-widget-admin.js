jQuery(function(a){"use strict";a(".coenv-fw-widget-form").CoEnvFWForm()}),function(a,b){"use strict";a.fn.CoEnvFWForm=function(){function c(c){a.post(b.ajaxurl,{action:"coenv_faculty_widget_get_faculty_filter_count",data:c},function(a){g.text(a)})}var d,e=a(this),f=a(this).find("select"),g=e.find(".filter-count");d={theme:a(this).find("#coenv-faculty-widget-theme-selector").find('option[selected="selected"]').attr("value"),unit:a(this).find("#coenv-faculty-widget-unit-selector").find('option[selected="selected"]').attr("value")},c(d),f.on("change",function(){"coenv-faculty-widget-theme-selector"===a(this).attr("id")&&(d.theme=a(this).attr("value")),"coenv-faculty-widget-unit-selector"===a(this).attr("id")&&(d.unit=a(this).attr("value")),c(d)}),a("body").ajaxSuccess(function(a,b,e){var f="coenv_faculty_widget";-1!==e.data.search("action=save-widget")&&-1!==e.data.search("id_base="+f)&&c(d)})},a.fn.CoEnvFWUnitSelector=function(){function c(){a.ajax({url:g,dataType:"jsonp",success:function(a){d(a),e(a)},error:function(a,b){console.log("error: "+b)}})}function d(c){var d={action:"coenv_faculty_widget_save_units",data:c};a.post(b.ajaxurl,d,function(){})}function e(b){var c=[];a.each(b,function(){var a=this;c.push('<option value="'+a.slug+'">'+a.name+"</option>")}),f.append(c)}var f=a(this),g=b.coenvfw.unitsEndpoint;f.length&&f.attr("data-units")!==!0&&a.post(b.ajaxurl,{action:"coenv_faculty_widget_get_units"},function(a){"false"===a&&c()})}}(jQuery,window,document);