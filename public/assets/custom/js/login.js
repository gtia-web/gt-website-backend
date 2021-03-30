async function loginRequest() {
    form = $('#login-data')

    //Validation
    invalid = false

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

        res = await Promise.resolve($.post('/user/login', {
            password:  password,
            username: username
        })) 

        if (res.status == 'success') {
            $(location).attr('href', '/')
        } else {
            $('#error-message-container').find('.error-message').html('Login Failed') 
            form.find('input[name ="username"]').addClass('input-error-highlight')            
            form.find('input[name ="password"]').addClass('input-error-highlight')           
            $('#error-message-container').removeClass('hidden')
        }    
    }
}