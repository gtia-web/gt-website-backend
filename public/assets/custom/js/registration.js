function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
    
async function registrationRequest() {

    form = $('#register-data')
    invalid = false

    firstname = form.find('input[name ="firstname"]').val()
    form.find('input[name ="firstname"]').removeClass('input-error-highlight')
    if(firstname == '') {
        invalid = true
        form.find('input[name ="firstname"]').addClass('input-error-highlight')
    }

    lastname = form.find('input[name ="lastname"]').val()
    form.find('input[name ="lastname"]').removeClass('input-error-highlight')
    if(lastname == '') {
        invalid = true
        form.find('input[name ="lastname"]').addClass('input-error-highlight')
    }

    email = form.find('input[name ="email"]').val()
    form.find('input[name ="email"]').removeClass('input-error-highlight')
    if (email == '') {
        invalid = true
        form.find('input[name ="email"]').addClass('input-error-highlight')
    } else if (!validateEmail(email)){
        invalid = true
        form.find('input[name ="email"]').addClass('input-error-highlight')
        $('#email-error-message-container').find('.error-message').html('Invalid Email')           
        $('#email-error-message-container').removeClass('hidden')
    } else {
        $('#email-error-message-container').addClass('hidden')
    }

    username = form.find('input[name ="username"]').val()
    form.find('input[name ="username"]').removeClass('input-error-highlight')
    if(username == '') {
        invalid = true
        form.find('input[name ="username"]').addClass('input-error-highlight')
    }

    password = form.find('input[name="password"]').val()
    form.find('input[name ="password"]').removeClass('input-error-highlight')
    if(password == '') {
        invalid = true
        form.find('input[name ="password"]').addClass('input-error-highlight')
    }

    if (!invalid){
        $('#username-error-message-container').addClass('hidden')
        $('#runtime-error-message-container').addClass('hidden')

        res = await Promise.resolve($.post('/user/register', {
            password:  password,
            username: username,
            lastname: lastname,
            firstname: firstname,
            email: email
        }))

        if (res.runtimeErrorOccurred) {
            $('#runtime-error-message-container').find('.error-message').html('Something went wrong. Try Again!')           
            $('#runtime-error-message-container').removeClass('hidden')
        } else if (res.existAlready) {
            form.find('input[name ="username"]').addClass('input-error-highlight')
            $('#username-error-message-container').find('.error-message').html('Username Unavailable')           
            $('#username-error-message-container').removeClass('hidden')
            
        } else {
            new_body = "<div class='row login-preheading-text'><div class='col-12'>" +
                    "Welcome to GTIA!</div></div><div class='row login-heading-text recieved-text'><div class='col-12'>" +
                    "Your registration has been received.</div></div><div class='row login-preheading-text'><div class='col-12'>" +
                    "A GTIA Executive board member will reach out to you when your account has been created!</div></div>" +
                    "<div class='row login-preheading-text extra-text'><div class='col-12'>" +
                    "You will be redirect shortly.</div></div>"

            $('#registration-body').html(new_body)
            setTimeout( () => {
                $(location).attr('href', res.redirect)
            }, 10000);         
        }
        
        
    }

}

