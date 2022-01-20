function emailValidator () {
    return function email (value) {
      return (value && !!value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) || 'Please enter a valid email'
    }
  }

  function telephoneValidator () {
    return function email (value) {
      return (value && !!value.match(/^[\+]?[(]?[0-9]{1,2}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}/)) || 'Please enter a valid telephone number'
    }
  }
  
  function requiredValidator () {
    return function required (value) {
      return (value !== undefined && value !== null && value !== '') || 'This field is required'
    }
  }
  
  export {
    telephoneValidator,
    emailValidator,
    requiredValidator
  }
  