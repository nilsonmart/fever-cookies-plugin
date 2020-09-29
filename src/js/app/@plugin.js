/*  ========================================================================
	FeverCookiePlugin by FEVER Agency 
	========================================================================  */

/* eslint-disable no-undef */
(function (root, factory) {
	let feverCookieBar = 'FeverCookieBar'

	if (typeof define === 'function' && define.amd) {
		define([], factory(feverCookieBar))
	} else if (typeof exports === 'object') {
		module.exports = factory(feverCookieBar)
	} else {
		root[feverCookieBar] = factory(feverCookieBar)
	}

})(typeof global !== 'undefined' ? global : this.window || this.global, () => {
	/* eslint-enable no-undef */
	'use strict'

	//Check if browser has Nodelist foreach, if not set Array to Nodelist 
	if (window.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach	

	const defaults = {
		layout: {
			overlay: false, // true or false
			color: {
				primary: '#f60',
				secondary: '#000'
			},
			borderRadius: 10,
			bar: {
				position: 'bottom', //bottom or top
				text: 'By continuing to browse or by clicking "Accept All Cookies", you agree to the storing of first and third-party cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts',
				textColor: 'white', //white or black
				link: {
					text: 'Cookie Privacy',
					target: '_blank',
					url: 'https://gdpr-info.eu/'
				},
				labels: {
					acceptAll: 'Accept all cookies',
					rejectAll: 'I do not accept',
					settings: 'Cookie Settings'
				}
			}
		},
		modal: {
			title: 'Privacy Preference Center',
			logo: 'https://feverstorage.blob.core.windows.net/cookies/img/cookies-logo.svg', //default size 150x80
			labels: {
				acceptAll: 'Accept all',
				save: 'Save preferences'
			},
			required: {
				tabs: [{
					id: 'your-privacy',
					title: 'Your Privacy',
					text: 'When you visit any web site, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences, your device or used to make the site work as you expect it to. The information does not usually identify you directly, but it can give you a more personalized web experience. You can choose not to allow some types of cookies. Click on the different category headings to find out more and change our default settings. However, you should know that blocking some types of cookies may impact your experience on the site and the services we are able to offer.',
					label: ''
				},
				{
					id: 'strictly-necessary-cookies',
					title: 'Strictly Necessary Cookies',
					text: 'These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site may not work then.',
					label: 'Always enabled'
				}]
			},
			optional: {
				labels: {
					enabled: 'Enabled',
					disabled: 'Disabled'
				},
				tabs: []
			}
		}
	}

	const element = {
		body: document.body
	}

	const vars = {
		hexaColor: /(?:[0-9a-f]{3}){1,2}$/i
	}

	/**
	 * Merge defaults with user options
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 */

	const extend = (target, options) => {
		let prop, extended = {}
		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop]
			}
		}
		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop]
			}
		}
		return extended
	}

	/*  ========================================================================
    TRANSITION Functions
    ========================================================================  */

	/**
	 * Helper Function, not directly acessible by instance object
	@private fadeIn effect
	@param {object} element cookie bar
	*/

	const fadeIn = el => {
		if (el) {
			el.style.opacity = 0;
			(function fade() {
				let val = parseFloat(el.style.opacity)
				if (!((val += .1) > 1)) {
					el.style.opacity = val
					requestAnimationFrame(fade)
				}
			})()
		}
	}

	/**
	 * Helper Function, not directly acessible by instance object
	@private  fadeOut effect
	@param {object} element cookie bar
	*/

	const fadeOut = el => {
		if (el) {
			el.style.opacity = 1;
			(function fade() {
				if ((el.style.opacity -= .1) < 0) {
					el.style.display = 'none'
				} else {
					requestAnimationFrame(fade)
				}
			})()
		}
	}

	/*  ========================================================================
    COOKIE BAR Functions
    ========================================================================  */

	/**
	 * Bar Function, not directly acessible by instance object
	@private inject cookie bar html
	@param {object} element cookie bar
	@param {object} target default settings
	*/

	const cookieBarInject = (el, target) => {
		el = document.createElement('div')
		el.classList.add('fever-cookie__bar')
		el.style.opacity = '0'
		fadeIn(el)
		element.body.appendChild(el)

		//check if needs policy link
		const policyLink = target.options.layout.bar.link ? `<a href="${target.options.layout.bar.link.url}" target="${target.options.layout.bar.link.target}" class="fever-cookie__bar-link">${target.options.layout.bar.link.text}</a>` : ''

		//check if needs reject button
		const buttonRejectCookies = target.options.layout.bar.labels.rejectAll ? `<button class="fever-button fever-button--reject js-cookies-reject">${target.options.layout.bar.labels.rejectAll}</button>` : ''

		//insert html in fevercookie bar
		el.insertAdjacentHTML('afterbegin', `
			<div class="fever-cookie__container">
				<div class="fever-cookie__bar-text">
					<span>${target.options.layout.bar.text}</span>
					${policyLink}
				</div>
				<button class="fever-button fever-button--settings js-cookies-settings">${target.options.layout.bar.labels.settings}</button>
				${buttonRejectCookies}
				<button class="fever-button fever-button--allow js-cookies-accept-all">${target.options.layout.bar.labels.acceptAll}</button>
			</div>
		`)
	}

	/**
	 * Bar Function, not directly acessible by instance object
	@private cookie bar layout  with user options and default as fallback
	@param {object} element cookie bar
	@param {object} target default settings
	*/

	const cookieBarLayout = (el, target) => {
		const colorPrimary = target.options.layout.color.primary.match(vars.hexaColor),
			colorSecondary = target.options.layout.color.secondary.match(vars.hexaColor)

		target.options.layout.bar.position === 'top' ? el.classList.add('fever-cookie__bar--top') : el.classList.add('fever-cookie__bar--bottom')
		target.options.layout.bar.textColor === 'white' ? el.classList.add('fever-cookie__bar-text--white') : el.classList.add('fvr-cookie__bar-text--black')
		el.style.backgroundColor = `#${colorSecondary}`

		document.querySelectorAll('.fever-button:not(.fever-button--settings)').forEach(selector => selector.style.backgroundColor = `#${colorPrimary}`)
		document.querySelectorAll('.fever-button').forEach(selector => {
			selector.style.borderRadius = `${target.options.layout.borderRadius}px`
			selector.style.borderColor = `#${colorPrimary}`
		})

		target.options.layout.overlay === true ? document.body.classList.add('fever-cookie__overlay') : ''

	}

	/**
	 * Bar Function, not directly acessible by instance object
	@private remove cookie bar
	*/

	const cookieBarRemove = () => {
		fadeOut(document.querySelector('.fever-cookie__bar'))
	}

	/*  ========================================================================
	COOKIE MODAL Functions
	========================================================================  */

	/**
	 * Modal Function, not directly acessible by instance object
	@private inject required tabs in Modal
	@param {object} target default settings
	*/

	const cookieModalInjectRequiredTabs = target => {

		target.options.modal.required.tabs.forEach(currentTab => {

			document.querySelector('.js-cookies-tabs').insertAdjacentHTML('beforeend', `
				<li class="fever-cookie__modal-tabs-item js-cookies-tab-item" data-tab="${currentTab.id}">${currentTab.title}</li>
			`)

			document.querySelector('.js-tabs-required').insertAdjacentHTML('beforeend', `
				<div class="fever-cookie__modal-tabs-content js-tab-required" data-cookies-tab-id="${currentTab.id}">
					<div class="fever-cookie__modal-title">${target.options.modal.title}</div>
						<div class="fever-cookie__modal-tabs-content-title">
							<span>${currentTab.title}</span>
							<label class="fever-cookie__modal-label">${currentTab.label}</label>
						</div>
					<div class="fever-cookie__modal-tabs-content-text">${currentTab.text}</div>
				</div>
			`)
		})
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private inject optional tabs in Modal
	@param {object} target default settings
	*/

	const cookieModalInjectOptionalTabs = target => {

		target.options.modal.optional.tabs.forEach((currentTab, idx) => {

			const defaultValue = readCookie(`fevercookie-optional-${currentTab.id}`) === 'true' ? 'checked' : ''

			document.querySelector('.js-cookies-tabs').insertAdjacentHTML('beforeend', `
				<li class="fever-cookie__modal-tabs-item js-cookies-tab-item" data-tab="${currentTab.id}">${currentTab.title}</li>
			`)

			document.querySelector('.fever-cookie__modal-tabs').insertAdjacentHTML('beforeend', `
				<div class="fever-cookie__modal-tabs-content js-tab-optional" data-cookies-tab-id="${currentTab.id}">
					<div class="fever-cookie__modal-title">${target.options.modal.title}</div>
						<div class="fever-cookie__modal-tabs-content-title">
							<span>${currentTab.title}</span>
							<input id="fever-cookie__checkbox-${idx}" ${defaultValue} class="fever-cookie__modal-input js-cookies-checkbox" type="checkbox">
								<label class= "fever-cookie__modal-label js-cookies-label" for="fever-cookie__checkbox-${idx}">
									<span>${target.options.modal.optional.labels.disabled}</span>
								</label>
						</div>
					<div class="fever-cookie__modal-tabs-content-text">${currentTab.text}</div>
				</div>
			`)
		})
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private inject Modal in HTML
	@param {object} element cookie modal
	@param {object} target default settings
	*/

	const cookieModalInject = (el, target) => {
		el = document.createElement('div')
		el.classList.add('fever-cookie__modal')
		element.body.appendChild(el)

		el.insertAdjacentHTML('afterbegin', `
			<div class="fever-cookie__modal-container">
				<div class="fever-cookie__modal-header">
					<div class="fever-cookie__modal-close">
						<button class="fever-cookie__modal-button-close fever-button-modal js-cookies-close">X</button>
					</div>
					<div class="fever-cookie__modal-logo">
						<img class="fever-cookie__modal-image" src="${target.options.modal.logo}" alt="logo">
					</div>
					<div class="fever-cookie__modal-title">${target.options.modal.title}</div>
				</div>
				<div class="fever-cookie__modal-body">
					<div class="fever-cookie__modal-tabs js-tabs-required">
						<ul class="js-cookies-tabs fever-cookie__modal-tabs-list">
						</ul>
					</div>
				</div>
				<div class="fever-cookie__modal-footer">
					<button class="fever-cookie__modal-button fever-button-modal js-cookies-save">${target.options.modal.labels.save}</button>				
					<button class="fever-cookie__modal-button fever-button-modal js-cookies-accept-all">${target.options.modal.labels.acceptAll}</button>
				</div>
			</div>
		`)
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private Modal layout with user option and default as fallback
	@param {object} target default settings
	*/

	const cookieModalLayout = target => {
		const colorPrimary = target.options.layout.color.primary.match(vars.hexaColor)

		//FIX a bug that happens sometimes by setting background color in container
		document.querySelector('.fever-cookie__modal-container').style.backgroundColor = `#${colorPrimary}`
		document.querySelector('.fever-cookie__modal-header').style.backgroundColor = `#${colorPrimary}`
		document.querySelector('.fever-cookie__modal-footer').style.backgroundColor = `#${colorPrimary}`
		document.querySelector('.fever-cookie__modal-container').style.borderRadius = (target.options.layout.borderRadius >= 15 ? '15px' : `${target.options.layout.borderRadius}px`)
		document.querySelector('.js-cookies-close').style.color = `#${colorPrimary}`
		document.querySelector('.fever-cookie__modal .js-cookies-accept-all').style.color = `#${colorPrimary}`
		window.addEventListener('load', () => document.body.classList.contains('fever-cookie__overlay') ? document.querySelector('.fever-cookie__modal').style.backgroundColor = 'transparent' : '')

		document.querySelectorAll('.fever-button-modal').forEach(selector => selector.style.borderRadius = `${target.options.layout.borderRadius}px`)
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private open Modal
	*/

	const cookieModalOpen = () => {
		document.querySelector('.fever-cookie__modal').classList.add('active')
		element.body.style.overflow = 'hidden'
		document.querySelectorAll('.fever-cookie__modal-tabs-item,.fever-cookie__modal-tabs-content').forEach(selector => selector.classList.remove('cookie-current'))
		document.querySelectorAll('.fever-cookie__modal-tabs-item').forEach((selector, idx) => idx === 0 ? selector.classList.add('cookie-current') : '')
		document.querySelector('.fever-cookie__modal-tabs-content').classList.add('cookie-current')
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private close Modal
	*/

	const cookieModalClose = () => {
		document.querySelector('.fever-cookie__modal').classList.remove('active')
		element.body.removeAttribute('style')
	}

	/**
	 * Modal Function, not directly acessible by instance object
	@private Tab switcher Modal
	*/

	const cookieModalTabs = () => {

		document.querySelectorAll('.fever-cookie__modal-tabs-item').forEach(() => {
			document.addEventListener('click', e => {
				if (e.target && e.target.classList.contains('js-cookies-tab-item')) {
					const dataTab = e.target.dataset.tab
					document.querySelectorAll('.fever-cookie__modal-tabs-item,.fever-cookie__modal-tabs-content').forEach(selector => selector.classList.remove('cookie-current'))
					e.target.classList.add('cookie-current')
					document.querySelector(`[data-cookies-tab-id=${dataTab}]`).classList.add('cookie-current')
				}
			})
		})
	}

	/*  ========================================================================
	COOKIE Remove Overlay if specified in url
	========================================================================  */

	/**
	 *Remove overlay function, not directly acessible by instance object
	@private Remove overlay if specified in url
	@returns
	*/

	const cookieRemoveOverLayUrl = () => {
		const queryStrings = (queryString => {
			if (queryString === '') return {}
			let queryStringArray = {}
			for (let i = 0; i < queryString.length; ++i) {
				const queryStringPartial = queryString[i].split('=', 2)
				if (queryStringPartial.length === 1)
					queryStringArray[queryStringPartial[0]] = ''
				else
					queryStringArray[queryStringPartial[0]] = decodeURIComponent(queryStringPartial[1].replace(/\+/g, ' '))
			}
			return queryStringArray
		})(window.location.search.substr(1).split('&'))

		const overlay = queryStrings['overlay']
		overlay && overlay === '0' ? document.body.classList.remove('fever-cookie__overlay') : ''	
	}

	/*  ========================================================================
	COOKIE UI Events Functions
	========================================================================  */

	/**
	 *User Interaction Events function, not directly acessible by instance object
	@private user interactions Events
	@param {object} target default settings
	*/

	const cookieEventsUI = target => {

		//invoke cookie modal tabs
		cookieModalTabs()

		//button settings -- open modal
		document.querySelector('.js-cookies-settings').addEventListener('click', () => cookieModalOpen())

		//buttons Misc -- remove cookiebar
		document.querySelectorAll('.js-cookies-reject, .js-cookies-accept-all, .js-cookies-save').forEach(selector =>
			selector.addEventListener('click', () => {
				cookieBarRemove()
				document.body.classList.contains('fever-cookie__overlay') ? document.body.classList.remove('fever-cookie__overlay') : ''
				document.querySelector('.fever-cookie__modal').removeAttribute('style')
			})
		)

		//button modal -- close modal
		document.querySelectorAll('.fever-button-modal').forEach(selector => selector.addEventListener('click', () => cookieModalClose()))

		//button toggle enable disable
		document.querySelectorAll('.js-cookies-checkbox').forEach(selector => selector.addEventListener('change', () => selector.nextElementSibling.children[0].textContent = selector.checked ? target.options.modal.optional.labels.enabled : target.options.modal.optional.labels.disabled))
	}

	/*  ========================================================================
	COOKIE STORAGE Functions
	========================================================================  */

	/**
	 *Cookie storage function, not directly acessible by instance object
	@private create a cookie in users browser
	@param {object} name cookie name
	@param {object} value cookie value
	@param {object} days number of days the cookie will be set
	*/

	const createCookie = (name, value, days) => {
		let expires

		if (days) {
			const date = new Date()
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
			expires = `expires=${date.toUTCString()}`
		}
		document.cookie = `${name}=${value || ''}; ${expires}; path=/`
	}

	/**
	 *Cookies storage function, not directly acessible by instance object
	@private read a cookie in users browser
	@param {object} name cookie name		
	*/

	const readCookie = name => {
		let cookie = {}
		document.cookie.split(';').forEach(el => {
			let [k, v] = el.split('=')
			cookie[k.trim()] = v
		})
		return cookie[name]
	}

	/*  ========================================================================
	COOKIE FX EVENTS Functions
	========================================================================  */

	/**
	 *Functionality events function, not directly acessible by instance object
	@private Enable all user events
	@param {object} target default settings
	*/

	const cookieEnabledAllEventsInjection = target => {
		target.options.modal.optional.tabs.forEach(tab => {
			if (tab.events && tab.events.on) {
				tab.events.on()
				createCookie(`fevercookie-optional-${tab.id}`, true, 365)
			} else
				console.warn(`WARNING: ${tab.id} events is not defined`)
		})
		cookieCheckAllOptional(target)
	}

	/**
	 *Functionality events function, not directly acessible by instance object
	@private Disable all user events
	@param {object} target default settings
	*/

	const cookieDisabledAllEventsInjection = target => {
		target.options.modal.optional.tabs.forEach(tab => {
			if (tab.events && tab.events.off) {
				tab.events.off()
				createCookie(`fevercookie-optional-${tab.id}`, false, -1)
			} else
				console.warn(`WARNING: ${tab.id} events is not defined`)
		})
		cookieUncheckAllOptional(target)
	}

	/**
	 *Functionality events function, not directly acessible by instance object
	@private Enable user selected events
	@param {object} target default settings
	@param {string} tabElementId id of the tab enabled
	*/

	const cookieEnabledSelectedEventsInjection = (target, tabElementId) => {
		target.options.modal.optional.tabs.filter(el => {
			if (tabElementId === el.id) {
				if (el.events && el.events.on) {
					el.events.on()
					createCookie(`fevercookie-optional-${tabElementId}`, true, 365)
					createCookie('fevercookie-optional-state', 'accept-some', 365)
				} else
					console.warn(`WARNING: ${el.id} events is not defined`)
			}
		})
	}

	/**
	 *Functionality events function, not directly acessible by instance object
	@private Disable user selected events
	@param {object} target default settings
	@param {string} tabElementId id of the tab disabled
	*/

	const cookieDisabledSelectedEventInjection = (target, tabElementId) => {
		target.options.modal.optional.tabs.filter(el => {
			if (tabElementId === el.id) {
				if (el.events && el.events.off) {
					el.events.off()
					createCookie(`fevercookie-optional-${tabElementId}`, false, -1)
				} else
					console.warn(`WARNING: ${el.id} events is not defined`)
			}
		})
	}

	/**
	 *Functionality events helper, not directly acessible by instance object
	@private Helper Enable all user events
	@param {object} target default settings
	*/

	const cookieCheckAllOptional = target => {
		document.querySelectorAll('.js-tab-optional').forEach(tab => {
			const input = tab.querySelector('input')
			if (!input.checked) {
				tab.querySelector('.js-cookies-label').click()
				input.nextElementSibling.children[0].textContent = target.options.modal.optional.labels.enabled
			}
		})
	}

	/**
	 *Functionality events helper, not directly acessible by instance object
	@private Helper disable all user events
	@param {object} target default settings
	*/

	const cookieUncheckAllOptional = target => {
		document.querySelectorAll('.js-tab-optional').forEach(tab => {
			const input = tab.querySelector('input')
			if (input.checked) {
				tab.querySelector('.js-cookies-label').click()
				input.nextElementSibling.children[0].textContent = target.options.modal.optional.labels.disabled
			}
		})
	}

	/**
	 *Functionality events function, not directly acessible by instance object
	@private user actions to enable/disable cookies
	@param {object} target default settings
	*/

	const cookieEventsFX = target => {
		//button reject		
		if (document.querySelector('.js-cookies-reject')) {
			document.querySelector('.js-cookies-reject').addEventListener('click', () => {
				createCookie('fevercookie-optional-state', 'reject-all', 0)
				cookieDisabledAllEventsInjection(target)
			})
		}

		//button accept all
		document.querySelectorAll('.js-cookies-accept-all').forEach(btn => {
			btn.addEventListener('click', () => {
				createCookie('fevercookie-optional-state', 'accept-all', 365)
				cookieEnabledAllEventsInjection(target)
			})
		})

		//button save
		document.querySelector('.js-cookies-save').addEventListener('click', () => {

			let checkedTabs = 0,
				itemsProcessed = 0

			const optionalTabs = document.querySelectorAll('.js-tab-optional')

			optionalTabs.forEach(tab => {
				itemsProcessed++
				if (tab.querySelector('input:checked')) {
					cookieEnabledSelectedEventsInjection(target, tab.dataset.cookiesTabId)
					checkedTabs++
				} else
					cookieDisabledSelectedEventInjection(target, tab.dataset.cookiesTabId)

				if (itemsProcessed === optionalTabs.length) {
					checkedTabs > 0 ?
						createCookie('fevercookie-optional-state', checkedTabs < optionalTabs.length ? 'accept-some' : 'accept-all', 365) :
						createCookie('fevercookie-optional-state', 'accept-none', 0)
				}
			})
		})
	}

	/*  ========================================================================
	ONLOAD Read Cookies Functions
	========================================================================  */

	/**
	 * Helper Function, not directly acessible by instance object
	@private Read Cookies on Load page
	@param {object} target default settings	 
	*/

	const cookieOnLoadFX = target => {

		if (readCookie('fevercookie-optional-state')) {
			//check if user rejected or accepted cookies then remove cookie bar
			document.querySelector('.fever-cookie__bar').outerHTML = ''

			//trigger events on load that had been selected
			const optionalTabs = document.querySelectorAll('.js-tab-optional')

			optionalTabs.forEach(tab => {
				if (tab.querySelector('input:checked'))
					cookieEnabledSelectedEventsInjection(target, tab.dataset.cookiesTabId)
			})

			//button toggle enable disable on load
			document.querySelectorAll('.js-cookies-checkbox').forEach(selector => selector.nextElementSibling.children[0].textContent = selector.checked ? target.options.modal.optional.labels.enabled : target.options.modal.optional.labels.disabled)

			//remove overlay if user accepted or rejected cookies
			document.body.classList.remove('fever-cookie__overlay')
		}
	}

	/**
	 * FeverCookiePlugin prototype
	 * @public
	 * @constructor
	 */

	FeverCookiePlugin.prototype = {

		init() {
			cookieBarInject(this.cookieBar, this)
			cookieBarLayout(document.querySelector('.fever-cookie__bar'), this)
			cookieModalInject(this.cookieModal, this)
			cookieModalInjectRequiredTabs(this)
			cookieModalInjectOptionalTabs(this)
			cookieModalLayout(this)
			cookieEventsUI(this)
			cookieEventsFX(this)
			cookieOnLoadFX(this)
			cookieRemoveOverLayUrl()
		},

		openModal() {
			cookieModalOpen()
		},

		expireCookie(name) {
			createCookie(name, null, -1)
		}
	}

	/**
	 * FeverCookiePlugin Object
	 * @param {Object} options User options
	 * @constructor
	 */
	function FeverCookiePlugin(options) {
		this.options = extend(defaults, options)
		// Initialize Code Here
		this.init()
	}

	return FeverCookiePlugin
})