document.addEventListener('DOMContentLoaded', () => {
	formFieldsInit();
	formSubmit(true);
});

function formFieldsInit() {
	document.body.addEventListener("focusin", handleFocusIn);
	document.body.addEventListener("focusout", handleFocusOut);
}

function handleFocusIn(e) {
	const targetElement = e.target;
	if (['INPUT', 'TEXTAREA'].includes(targetElement.tagName)) {
			if (targetElement.dataset.placeholder) {
					targetElement.placeholder = '';
			}
			toggleFocusClass(targetElement, true);
			formValidate.removeError(targetElement);
	}
}

function handleFocusOut(e) {
	const targetElement = e.target;
	if (['INPUT', 'TEXTAREA'].includes(targetElement.tagName)) {
			if (targetElement.dataset.placeholder) {
					targetElement.placeholder = targetElement.dataset.placeholder;
			}
			toggleFocusClass(targetElement, false);
			targetElement.parentElement.classList.add('_check-focus');

			if (targetElement.hasAttribute('data-validate')) {
					formValidate.validateInput(targetElement);
			}
	}
}

function toggleFocusClass(element, isFocused) {
	element.classList.toggle('_form-focus', isFocused);
	element.parentElement.classList.toggle('_form-focus', isFocused);
}

const formValidate = {
	getErrors(form) {
			return Array.from(form.querySelectorAll('*[data-required]'))
					.filter(item => (item.offsetParent !== null || item.tagName === "SELECT") && !item.disabled)
					.reduce((errorCount, item) => errorCount + this.validateInput(item), 0);
	},
	validateInput(item) {
			let error = 0;
			const value = item.value.trim();
			const type = item.dataset.required;

			if (type === "email") {
					item.value = value.replace(" ", "");
					error += this.emailTest(item) ? this.addError(item) : this.removeError(item);
			} else if (type === "name") {
					item.value = value.replace(/[^А-Яа-яёA-Za-z-]/g, '');
					error += value.length < 3 ? this.addError(item, "Минимальная длинна 4 символа") : this.removeError(item);
			} else if (type === "tel") {
					error += value.length < 10 ? this.addError(item, "Минимальная длинна 10 символов") : this.removeError(item);
			} else if (item.type === "checkbox" && !item.checked) {
					error += this.addError(item);
			} else {
					error += !value ? this.addError(item) : this.removeError(item);
			}
			return error;
	},
	addError(item, message = item.dataset.error) {
			item.classList.add('_form-error');
			item.parentElement.classList.add('_form-error');
			item.parentElement.classList.remove('_check-focus');
			const errorElement = item.parentElement.querySelector('.form__error');
			if (errorElement) errorElement.remove();
			if (message) {
					item.parentElement.insertAdjacentHTML('beforeend', `<span class="form__error">${message}</span>`);
			}
			return 1;
	},
	removeError(item) {
			item.classList.remove('_form-error');
			item.parentElement.classList.remove('_form-error');
			const errorElement = item.parentElement.querySelector('.form__error');
			if (errorElement) errorElement.remove();
			return 0;
	},
	formClean(form) {
			form.reset();
			setTimeout(() => {
					form.querySelectorAll('input,textarea').forEach(el => {
							el.parentElement.classList.remove('_form-focus');
							el.classList.remove('_form-focus');
							this.removeError(el);
							el.value = el.dataset.placeholder || '';
					});
					form.querySelectorAll('.checkbox__input').forEach(checkbox => {
							checkbox.checked = false;
					});
			}, 0);
	},
	emailTest(item) {
			return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(item.value);
	}
};

document.addEventListener('input', (e) => {
	const input = e.target;
	if (input.dataset.required === "name") {
			input.value = input.value.replace(/[^А-Яа-яёA-Za-z-]/g, '');
	}
	if (input.value.length > 350) {
			input.value = input.value.slice(0, 350);
	}
});

function formSubmit(validate) {
	Array.from(document.forms).forEach(form => {
			form.addEventListener('submit', (e) => formSubmitAction(form, e, validate));
			form.addEventListener('reset', () => formValidate.formClean(form));
	});
}

async function formSubmitAction(form, e, validate) {
	const error = validate ? formValidate.getErrors(form) : 0;
	if (error !== 0) {
			e.preventDefault();
			const formError = form.querySelector('._form-error');
			if (formError && form.hasAttribute('data-goto-error')) {
					// Implement gotoBlock logic here
			}
	}
}