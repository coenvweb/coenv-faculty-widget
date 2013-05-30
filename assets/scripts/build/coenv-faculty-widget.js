jQuery(function(a){"use strict";a(".coenv-fw").coenvfw({})}),function(a,b){"use strict";a.CoEnvFw=function(b,c){this.options=b,this.element=a(c),this._init()},a.CoEnvFw.settings={ajaxobject:b.coenvfw,ajaxurl:b.coenvfw.ajaxurl,facultyEndpoint:b.coenvfw.facultyEndpoint,memberLimit:25,widgetClass:"coenv-fw",sectionClass:"coenv-fw-section",feedbackClass:"coenv-fw-feedback",feedbackLoadingClass:"coenv-fw-feedback-loading",feedbackNumberClass:"coenv-fw-feedback-number",resultsClass:"coenv-fw-results",memberClass:"coenv-fw-member",memberInnerClass:"coenv-fw-member-inner",memberImageClass:"coenv-fw-member-image",memberNameClass:"coenv-fw-member-name"},a.CoEnvFw.prototype._init=function(b){var c=this;this.options=a.extend(!0,{},a.CoEnvFw.settings,b),this._elements(),this._getMembers().then(function(){c._renderMembers()})},a.CoEnvFw.prototype._elements=function(){this.$feedback=this.element.find("."+this.options.feedbackClass),this.$feedbackLoading=this.element.find("."+this.options.feedbackLoadingClass),this.$feedbackNumber=this.element.find("."+this.options.feedbackNumberClass),this.$resultsList=this.element.find("."+this.options.resultsClass)},a.CoEnvFw.prototype._getMembers=function(){var b=new a.Deferred,c=this,d={action:"coenv_faculty_widget_get_members"};return a.post(this.options.ajaxurl,d,function(d){"false"!==d?(c.members=a.parseJSON(d),b.resolve()):c._remoteGetMembers().then(function(){b.resolve()})}),b.promise()},a.CoEnvFw.prototype._remoteGetMembers=function(){var b=new a.Deferred,c=this;return a.ajax({url:c.options.facultyEndpoint,dataType:"jsonp",success:function(a){c.members=a,c.members.length||c._failed(),c._saveMembers(a),b.resolve()},error:function(a,b){c._failed(b)}}),b.promise()},a.CoEnvFw.prototype._saveMembers=function(b){var c=[];a.each(b,function(){c.push({permalink:this.permalink,full_name:this.full_name,first_name:this.first_name,last_name:this.last_name})});var d={action:"coenv_faculty_widget_save_members",members:b};a.ajax({url:this.options.ajaxurl,data:d,type:"POST",success:function(){},error:function(a){console.log(a)}})},a.CoEnvFw.prototype._failed=function(a){this.$feedbackLoading.html('<a href="#">See all faculty &raquo;</a>'),a&&console.log(a)},a.CoEnvFw.prototype._renderMembers=function(){var b=this.members,c='<p><span class="'+this.options.feedbackNumberClass+'">'+b.length+'</span> faculty working on <a href="#">Climate</a> in <a href="#">Earth &amp; Space Sciences</a></p>',d=[],e=this;this.$feedback.html(c),a.each(b,function(){var b=this,c=a("<li></li>"),f=a("<a></a>"),g=a("<img />"),h=a("<p></p>");c.addClass(e.options.memberClass),c.attr("style","background-color: "+b.units[0].color+";"),f.addClass(e.options.memberInnerClass),f.attr("href",b.permalink),g.addClass(e.options.memberImageClass),g.attr("src",b.images.thumbnail.url),g.appendTo(f),h.addClass(e.options.memberNameClass),h.text(b.full_name),h.appendTo(f),f.appendTo(c),d.push(c)}),this.$resultsList.append(d)},a.CoEnvFw.prototype.option=function(b){a.isPlainObject(b)&&(this.options=a.extend(!0,this.options,b))},a.fn.coenvfw=function(b){if("string"==typeof b){var c=Array.prototype.slice.call(arguments,1);this.each(function(){var d=a.data(this,"coenvfw");return d?a.isFunction(d[b])&&"_"!==b.charAt(0)?(d[b].apply(d,c),void 0):(console.log("error","no such method "+b+" for coenvfw instance"),void 0):(console.log("error","cannot call methods on coenvfw prior to initialization. attempted to call method "+b),void 0)})}else this.each(function(){var c=a.data(this,"coenvfw");c?(c.option(b||{}),c._init()):a.data(this,"coenvfw",new a.CoEnvFw(b,this))});return this}}(jQuery,window,document);