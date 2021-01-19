let Language = {};

const EntryElement = function EntryElement() {
	let _element		= null;
	let _type			= null;
	let _name			= null;
	let _title			= null;
	let _value			= null;
	let _default		= null;
	let _list			= null;
	let _list_index		= 0;
	let _description	= null;
	let _container		= null;
	
	this.__constructor = function __constructor() {
		_element	= document.createElement('ui-entry');
		_container	= document.createElement('ui-container');
		
		_element.onPrevious	= this.onPrevious.bind(this);
		_element.onNext		= this.onNext.bind(this);
	};
	
	this.setType = function setType(type) {
		_type					= type;
		_element.dataset.type	= type;
		
		let arrow_left			= this._createArrow('left');
		let arrow_right			= this._createArrow('right');
		
		switch(_type) {
			case 'Boolean':
				_container.appendChild(arrow_left);
				_container.appendChild(this._createText(_value == null ? (_default == null ? '' : (_default ? 'Yes' : 'No')) : (_value ? 'Yes' : 'No')));
				_container.appendChild(arrow_right);
			break;
			case 'Number':
				_container.appendChild(arrow_left);
				_container.appendChild(this._createInput('number', _value == null ? (_default == null ? '' : _default) : _value));
				_container.appendChild(arrow_right);
			break;
			case 'List':
				_container.appendChild(arrow_left);
				_container.appendChild(this._createText(_value == null ? (_default == null ? '' : _default) : _value));
				_container.appendChild(arrow_right);
			break;
			case 'Text':
				_container.appendChild(this._createInput('text', _value == null ? (_default == null ? '' : _default) : _value));
			break;
			case 'Password':
				_container.appendChild(this._createInput('password', _value == null ? (_default == null ? '' : _default) : _value));			
			break;
		}
	};
	
	this._createText = function _createText(text) {
		let element			= document.createElement('ui-text');
		element.innerHTML	= text;
		return element;
	};
	
	this._createInput = function _createInput(type, value) {
		let element			= document.createElement('input');
		element.type		= type;
		element.value		= value;
		return element;
	};
	
	this._createArrow = function _createArrow(direction) {
		let arrow				= document.createElement('ui-arrow');
		arrow.dataset.direction	= direction;
		return arrow;
	}
	
	this.setName = function setName(name) {
		_name					= name;
		_element.dataset.name	= name;
	};
	
	this.setTitle = function setTitle(title) {
		_title			= title;
		let name		= document.createElement('ui-name');
		name.innerHTML	= _title;
		_element.appendChild(name);
	};
	
	this.onPrevious = function onPrevious() {
		switch(_type) {
			case 'Boolean':
				this.setValue(!_value);
			break;
			case 'Number':
				this.setValue(_value - 1);				
			break;
			case 'List':
				console.log(_list);
				console.log('Old list index', _list_index);
				--_list_index;
				
				console.log('New list index', _list_index);
				if(_list_index < 0) {
					_list_index = _list.length - 1;
				}
				console.log('Updated list index', _list_index);
				
				
				this.setValue(_list[_list_index]);
			break;
		}
	};
	
	this.onNext = function onNext() {
		switch(_type) {
			case 'Boolean':
				this.setValue(!_value);
			break;
			case 'Number':
				this.setValue(_value + 1);
			break;
			case 'List':
				console.log(_list);
				console.log('Old list index', _list_index);
				++_list_index;
				console.log('New list index', _list_index);
				
				if(_list_index >= _list.length) {
					_list_index = 0;
				}
				console.log('Updated list index', _list_index);
				this.setValue(_list[_list_index]);
			break;
		}
	};
	
	this.setValue = function setValue(value) {
		_value = value;
		
		switch(_type) {
			case 'Boolean':
				_container.querySelector('ui-text').innerHTML = (_value ? 'Yes' : 'No');
			break;
			case 'Number':
				_value = parseInt(value, 10);
				_container.querySelector('input[type="number"]').value = _value;
			break;
			case 'List':
				_container.querySelector('ui-text').innerHTML = _value;
			break;
		}
	};
	
	this.setDefault = function setDefault(value) {
		_default					= value;
		_element.dataset.default	= value;
	};
	
	this.setList = function setList(list) {
		_list		= list;
		_list_index	= 0;
	};
	
	this.setDescription = function setDescription(description) {
		_description 					= description;
		_element.dataset.description	= description;
	};
	
	this.getElement = function getElement() {
		_element.appendChild(_container);
		return _element;
	};
	
	this.__constructor.apply(this, arguments);
};

customElements.define('ui-entry', EntryElement, { extends: 'div' });

const BotEditor = (new function BotEditor() {
	const DEBUG				= false;
	const VERSION			= '1.0.0-Beta';
	let _language			= 'en_US';
	const InputDeviceKeys	= {
		IDK_Enter:	13,
		IDK_F1:		112,
		IDK_F2:		113,
		IDK_F3:		114,
		IDK_F4:		115,
		IDK_F5:		116,
		IDK_F6:		117,
		IDK_F7:		118,
		IDK_F8:		119,
		IDK_F9:		120,
		IDK_F10:	121,
		IDK_F11:	122,
		IDK_F12:	123
	};
	
	this.__constructor = function __constructor() {
		console.log('Init BotEditor UI (v' + VERSION + ') by https://github.com/Bizarrus.');
		
		this.bindMouseEvents();
		this.bindKeyboardEvents();
		
		//this.openSettings('[{"title":"Spawn in Same Team","category":"GLOBAL","name":"spawnInSameTeam","description":"If true, Bots spawn in the team of the player","types":"Boolean","value":"false","default":"false"},{"title":"Bot FOV","category":"GLOBAL","name":"fovForShooting","description":"The Field Of View of the bots, where they can detect a player","types":"Number","value":"270.0","default":"270"},{"title":"Damage Bot Bullet","category":"GLOBAL","name":"bulletDamageBot","description":"The damage a normal Bullet does","types":"Number","value":"10.0","default":"9"},{"title":"Damage Bot Sniper","category":"TRACE","name":"bulletDamageBotSniper","description":"The damage a Sniper-Bullet does","types":"Number","value":"24.0","default":"24"},{"title":"Damage Bot Melee","category":"TRACE","name":"meleeDamageBot","description":"The Damage a melee-attack does","types":"Number","value":"48.0","default":"42"},{"title":"Attack with Melee","category":"TRACE","name":"meleeAttackIfClose","description":"Bots attack the playe with the knife, if close","types":"Boolean","value":"true","default":"true"},{"title":"Attack if Hit","category":"OTHER","name":"shootBackIfHit","description":"Bots imidiatly attack player, if shot by it","types":"Boolean","value":"true","default":"true"},{"title":"Aim Worsening","category":"OTHER","name":"botAimWorsening","description":"0.0 = hard, 1.0 (or higher) = easy (and all between). Only takes effect on level Start","types":"Number","value":"0.0","default":"0.0"},{"description":"The Kit a bots spawns with. If Random is selected a random color is chosen. See config.lua for Kits","title":"Bot Kit","category":"OTHER","name":"botKit","default":"RANDOM_KIT","types":"List","value":"RANDOM_KIT"},{"description":"The Kit-Color a bots spawns with.  If Random is selected  a random color is chosen. See config.lua for colors","title":"Bot Color","category":"OTHER","name":"botColor","default":"RANDOM_COLOR","types":"List","value":"RANDOM_COLOR","list":["RANDOM_COLOR","Urban","ExpForce","Ninja","DrPepper","Para","Ranger","Specact","Veteran","Desert02","Green","Jungle","Navy","Wood01"]},{"description":"Select the language of this mod","title":"Language","category":"OTHER","name":"language","default":"en_US","types":"List","value":"en_US","list":["de_DE","en_US"]},{"title":"Password","category":"OTHER","name":"settingsPassword","description":"Password protection of these Mod","types":"Password","value":"nil"}]');
	};
	
	this.bindMouseEvents = function bindMouseEvents() {
		document.body.addEventListener('mouseover', function onMouseDown(event) {
			if(!event) {
				event = window.event;
			}
			
			var parent = Utils.getClosest(event.target, '[data-description]');
			
			if(typeof(parent) == 'undefined') {
				return;
			}
			
			document.querySelector('ui-description').innerHTML = parent.dataset.description;
		});
		
		document.body.addEventListener('mouseout', function onMouseDown(event) {
			if(!event) {
				event = window.event;
			}
			
			var parent = Utils.getClosest(event.target, '[data-description]');
			
			if(typeof(parent) == 'undefined') {
				return;
			}
			
			document.querySelector('ui-description').innerHTML = '';
		});
		
		document.body.addEventListener('mousedown', function onMouseDown(event) {
			if(!event) {
				event = window.event;
			}
			
			var parent = Utils.getClosest(event.target, '[data-action]');
			
			if([
				'INPUT'
			].indexOf(event.target.nodeName) >= 0) {
				if(DEBUG) {
					console.warn('Parent is an form element!', parent);
				}
				
				return;
			}
			
			if(typeof(parent) == 'undefined') {
				if(DEBUG) {
					console.warn('Parent is undefined', parent);
				}
				
				return;
			}
			
			if(DEBUG) {
				console.log('CLICK', parent.dataset.action);
			}
			
			switch(parent.dataset.action) {
				/* Exit */
				case 'close':
					WebUI.Call('DispatchEventLocal', 'UI_Toggle');
				break;
				
				/* Bots */
				case 'bot_spawn_default':
					count = document.querySelector('[data-action="bot_spawn_default"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_spawn_default',
						value:	count.value
					}));
					count.value = 1;
				break;
				case 'bot_spawn_path':
					index = document.querySelector('[data-action="bot_spawn_path"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_spawn_path',
						value:	index.value
					}));
				break;
				case 'bot_kick_all':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_kick_all'
					}));
				break;
				case 'bot_kill_all':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_kill_all'
					}));
				break;
				case 'bot_respawn':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_respawn'
					}));
				break;
				case 'bot_attack':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_attack'
					}));
				break;
				
				/* Trace */
				case 'trace_start':
					index = document.querySelector('[data-action="trace_start"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_start',
						value: index.value
					}));
				break;
				case 'trace_end':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_end',
					}));
				break;
				case 'trace_clear':
					index = document.querySelector('[data-action="trace_clear"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_clear',
						value: index.value
					}));
				break;
				case 'trace_reset_all':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_reset_all'
					}));
				break;
				case 'trace_save':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_save'
					}));
				break;
				case 'trace_reload':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_reload'
					}));
				break;
				case 'trace_show':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_show'
					}));
				break;
				
				/* Settings */
				case 'request_settings':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'request_settings'
					}));
				break;

				case 'submit_settings_temp':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'submit_settings_temp'
					}));
				break;

				case 'submit_settings':
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'submit_settings'
					}));
				break;
				
				/* Other Stuff */
				default:
					if(event.target.nodeName == 'UI-ARROW') {
						let entry	= Utils.getClosest(event.target, 'ui-entry');
						
						switch(event.target.dataset.direction) {
							case 'left':
								entry.onPrevious();
							break;
							case 'right':
								entry.onNext();							
							break;
						}						
					}
					
					/* Sumbit Forms */
					if(parent.dataset.action.startsWith('submit')) {
						let form	= Utils.getClosest(event.target, 'ui-view').querySelector('[data-type="form"]');
						let action	= form.dataset.action;
						let data	= {
							subaction: null
						};
						
						if(parent.dataset.action.startsWith('submit_')) {
							data.subaction = parent.dataset.action.replace('submit_', '');
						}
						
						[].map.call(form.querySelectorAll('input[type="text"], input[type="password"]'), function onInputEntry(input) {
							if(typeof(input.name) !== 'undefined' && input.name.length > 0) {
								data[input.name] = input.value;
							}
						});
						
						/* UI-Entrys :: Boolean */
						[].map.call(form.querySelectorAll('ui-entry[data-type="Boolean"]'), function onInputEntry(input) {
							if(typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0) {
								data[input.dataset.name] = (input.querySelector('ui-text').innerHTML == 'Yes');
							}
						});
						
						/* UI-Entrys :: List */
						[].map.call(form.querySelectorAll('ui-entry[data-type="List"]'), function onInputEntry(input) {
							if(typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0) {
								data[input.dataset.name] = input.querySelector('ui-text').innerHTML;
							}
						});
						
						/* UI-Entrys :: Number, Text & Password */
						[].map.call(form.querySelectorAll('ui-entry[data-type="Number"], ui-entry[data-type="Text"], ui-entry[data-type="Password"]'), function onInputEntry(input) {
							if(typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0) {
								data[input.dataset.name] = input.querySelector('input').value;
							}
						});
						
						WebUI.Call('DispatchEventLocal', action, JSON.stringify(data));
					}
				break;
			}
		}.bind(this));
	};
	
	this.bindKeyboardEvents = function bindKeyboardEvents() {
		document.body.addEventListener('keydown', function onMouseDown(event) {
			let count;
			
			switch(event.keyCode || event.which) {
				/* Forms */
				case InputDeviceKeys.IDK_Enter:
					let form	= Utils.getClosest(event.target, 'ui-view');
					let submit	= form.querySelector('[data-action="submit"]');
					
					if(typeof(submit) !== 'undefined') {
						var clickEvent = document.createEvent('MouseEvents');
						clickEvent.initEvent('mousedown', true, true);
						submit.dispatchEvent(clickEvent);
					}
					
					// @ToDo get to next input and calculate the submit-end
				break;
				
				/* Bots */
				case InputDeviceKeys.IDK_F2:
					count = document.querySelector('[data-action="bot_spawn_default"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_spawn_default',
						value:	count.value
					}));
					count.value = 1;
				break;
				case InputDeviceKeys.IDK_F3:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_kick_all'
					}));
				break;
				case InputDeviceKeys.IDK_F4:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'bot_kill_all'
					}));
				break;
				
				/* Trace */
				case InputDeviceKeys.IDK_F5:
					index = document.querySelector('[data-action="trace_start"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_start',
						value:	index.value
					}));
				break;
				case InputDeviceKeys.IDK_F6:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_end'
					}));
				break;
				case InputDeviceKeys.IDK_F7:
					index = document.querySelector('[data-action="trace_clear"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_clear',
						value:	index.value
					}));
				break;
				case InputDeviceKeys.IDK_F8:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_reset_all'
					}));
				break;
				case InputDeviceKeys.IDK_F9:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_save'
					}));
				break;
				case InputDeviceKeys.IDK_F11:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'trace_reload'
					}));
				break;
				
				/* Settings */
				case InputDeviceKeys.IDK_F10:
					WebUI.Call('DispatchEventLocal', 'BotEditor', JSON.stringify({
						action:	'request_settings'
					}));
				break;
				
				/* Exit */
				case InputDeviceKeys.IDK_F12:
					WebUI.Call('DispatchEventLocal', 'UI_Toggle');
				break;
				
				/* Debug */
				default:
					if(DEBUG) {
						console.warn('Unknown/Unimplemented KeyCode', event.keyCode || event.which);
					}
				break;
			}
		});
	};
	
	this.openSettings = function openSettings(data) {
		let json;
		let container = document.querySelector('ui-view[data-name="settings"] figure');
		
		try {
			json = JSON.parse(data);
		} catch(e) {
			console.error(e, data);
			return;
		}
		
		/* Clear/Remove previous Data */
		[].map.call(container.querySelectorAll('ui-tab[class]'), function(element) {
			element.innerHTML = '';
		});
		
		json.forEach(function onEntry(entry) {
			let element	= container.querySelector('ui-tab[class="' + entry.category + '"]');
			let output	= new EntryElement();
			
			output.setType(entry.types);
			output.setName(entry.name);
			output.setTitle(entry.title);
			output.setValue(entry.value);
			output.setDefault(entry.default);
			output.setDescription(entry.description);
			
			switch(entry.types) {
				case 'List':
					output.setList(entry.list);			
				break;
				case 'Boolean':
				case 'Number':
				case 'Text':
				case 'Password':
				
				break;
			}
			
			element.appendChild(output.getElement());
		});		
	};
	
	/* Translate */
	this.loadLanguage = function loadLanguage(string) {
		if(DEBUG) {
			console.log('Trying to loading language file:', string);
		}
		
		let script	= document.createElement('script');
		script.type	= 'text/javascript';
		script.src	= 'languages/' + string + '.js';
		
		script.onload = function onLoad() {
			if(DEBUG) {
				console.log('Language file was loaded:', string);
			}
			
			_language = string;
			
			this.reloadLanguageStrings();
		}.bind(this);
		
		script.onerror = function onError() {
			if(DEBUG) {
				console.log('Language file was not exists:', string);
			}
		};
		
		document.body.appendChild(script);
	};
	
	this.reloadLanguageStrings = function reloadLanguageStrings() {
		[].map.call(document.querySelectorAll('[data-lang]'), function(element) {
			element.innerHTML = this.I18N(element.innerHTML);
		}.bind(this));
	};
	
	this.I18N = function I18N(string) {
		if(DEBUG) {
			let translated = null;
			
			try {
				translated = Language[_language][string];
			} catch(e){}
			
			console.log('[Translate]', _language, '=', string, 'to', translated);
		}
		
		/* If Language exists */
		if(typeof(Language[_language]) !== 'undefined') {
			/* If translation exists */
			if(typeof(Language[_language][string]) !== 'undefined') {
				return Language[_language][string];
			}
		}
		
		return string;
	};
	
	this.toggleTraceRun = function toggleTraceRun(state) {
		let menu	= document.querySelector('[data-lang="Start Trace"]');
		let string	= 'Start Trace';
		
		if(state) {
			string = 'Stop Trace';
		}
		
		menu.innerHTML = this.I18N(string);
	};
	
	this.getView = function getView(name) {
		return document.querySelector('ui-view[data-name="' + name + '"]');
	};
	
	this.show = function show(name) {
		if(DEBUG) {
			console.log('Show View: ', name);
		}
		
		let view = this.getView(name);
		
		view.dataset.show = true;
		view.setAttribute('data-show', 'true');
		
		switch(name) {
			/* Reset Error-Messages & Password field on opening */
			case 'password':
				view.querySelector('ui-error').innerHTML				= '';
				let password		= view.querySelector('input[type="password"]');
				password.value		= '';
				password.focus();
			break;
		}
	};
	
	this.hide = function hide(name) {
		if(DEBUG) {
			console.log('Hide View: ', name);
		}
		
		let view = this.getView(name);
		
		view.dataset.show = false;
		view.setAttribute('data-show', 'false');
	};
	
	this.error = function error(name, text) {
		if(DEBUG) {
			console.log('Error View: ', name);
		}
		
		let view	= this.getView(name);
		let error	= view.querySelector('ui-error');
		
		[].map.call(view.querySelectorAll('input[type="password"]'), function(element) {
			element.value = '';
		});
		
		error.innerHTML = text;
	};
	
	this.__constructor.apply(this, arguments);
}());