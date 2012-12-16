(function($){
	
	function setup($) {
			/*
			 * Check query version first
			 */
			
			if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery) || /^1.1/.test($.fn.jquery)) {
				alert('nodestrap requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
				return;
			}

			$.nodestrap = function(opts) { install(window, opts); };
			$.nodestrap.version = 1.01;
			
			/* 
			 * nodestrap defaults
			 */
			$.nodestrap.defaults = {
				reconnect_time : 5000,
				reconnect_attempts : 10000,
				objectName: 'node',
				socket : null,
			};
			
			/*
			 * Install plugin 
			 * Validate parameters
			 */
			install = function(ele,opts){	
				opts = $.extend({}, $.nodestrap.defaults, opts || {});
				if( opts.url == undefined || opts.url === null){
					alert('Please enter url');
					return;					
				}

				if( !validate_methods(opts.methods) ){
					alert('methods parameter can have only functions');
					return;	
				}
					
				init(opts);
			};
			
			/*
			 * Initialize perpetual getJSON script 
			 */
			init = function(opts) {
				var scriptLoader;
				clearTimeout(scriptLoader);
				get_script({
					url: opts.url + 'socket.io/socket.io.js',
					success: function(){
						socket_init(opts);
					},
					error: function(){
						scriptLoader = setTimeout(function(){
							init(opts);
						},opts.reconnect_time);
					}
				});
			};
			
			/*
			 * Initialize socket connection
			 */
			
			socket_init = function(opts){
				$.nodestrap.socket = io.connect(opts.url,{
					'reconnect': true,
					'reconnection delay': 5000,
					'max reconnection attempts': opts.reconnect_attempts,
					'connect timeout': 5000,
					'reopen delay': 5000,
				});
				
				for( var i in opts.methods){
					$.nodestrap.socket.on(i,opts.methods[i].bind(this));
				}
			};
			
			/*
			 * Custom socket.emit function
			 */
			emit = function(opts) {
				for(var j in opts){
					$.nodestrap.socket.emit( j, opts[j]);
				}
			};
			
			/*
			 * Validate methods
			 */
			validate_methods = function(methods){
				for( var i in methods){
					if( typeof methods[i] != 'function' )
						return false;
				}
				return true;
			};
			
			/*
			 * getJSON method
			 */
			get_script = function(options) {
			    var script = document.createElement('script');
			    script.setAttribute('type', 'text/javascript');
			    script.setAttribute('src', options.url);
			    script.onerror = options.error;
			    document.getElementsByTagName('head')[0].appendChild(script);
			    var head = document.getElementsByTagName('head');

			    script.onload = script.onreadystatechange = function() {
			        if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") { !! window[options.objectName] || !options.objectName ? options.success() : options.error();

			            // Handle memory leak in IE
			            script.onload = script.onreadystatechange = null;
			            head[0].removeChild(script);
			        }
			    };

			};
	};

	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], setup);
	} else {
		setup(jQuery);
	}
	
})(jQuery);