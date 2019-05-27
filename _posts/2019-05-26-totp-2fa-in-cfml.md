---
layout: post
title:  "Two-Factor Authentication with TOTP and CFML"
date:   2019-05-26 22:58:00
disqus: true
tags: [CFML,Security]
excerpt: A walkthrough example of how to implement 2-Factor authentication (2FA) using Time-based One-time Password Algorithm (TOTP) in a CFML application running on the Coldbox MVC framework.
---

I wanted to see how difficult it would be to implement 2-Factor authentication (2FA) in a CFML application I decided to try to implement use the Time-based One-time Password Algorithm since it has been used as a 2nd-factor for authentication for awhile. There are also many mobile applications available for generating one-time passwords on your mobile device. For this example I am using a demo application running on the Coldbox MVC framework.

### What is Time-based One-time Password Algorithm (TOTP)?

TOTP uses a shared key to generate a one-time password that is only valid for a short amount of time. This is typically about 30 seconds.There are mobile applications that can generate these one-time passwords to act as a second authentication method. A process for doing 2-Factor authentication with TOTP will typically look something like this.

1. User will submit their username/password combination to the server via an authentication form
2. Upon verification, the application then prompts them to enter a TOTP for the 2nd-factor authentication
3. The user opens an app such as Google Authenticator on their mobile device to get the TOTP
4. The user enters the TOTP in the application authentication form and submits
5. The server verifies the TOTP is valid and authenticates the user

### Server Verification

First, did some research to see what libraries were available to handle the TOTP creation and verification. I found a couple of options. There is a Java library named [GoogleAuth](http://wstrange/GoogleAuth) for working with TOTP. 

I also found this [CFML component](https://github.com/marcins/cf-google-authenticator) along with a [blog post](https://junkheap.net/blog/2013/05/30/implementing-google-authenticator-support-in-coldfusion/) on using it. I decided to use the CFML library even though it had not been updated for a while mainly because it would be a little easier to use in CFML. 

I made a few small changes to it for my use. I changed the generateKey() method to use a randomly generated seed instead of an argument. I also added a method to generate a registration QR code on the server using the [Zxing](https://github.com/zxing/zxing) library instead of using a Javascript library on the client. Here is the method used to generate the QR code.

#### QR Code Generation

```cfscript
    public any function getOTPQRCode(required string name, required string key)
    {
        var data = 'otpauth://totp/#arguments.name#?secret=#arguments.key#';

        /* Create the QR Code */
        var barcodeFormat = createObject("java","com.google.zxing.BarcodeFormat");
        var QRCodeWriter = createObject("java","com.google.zxing.qrcode.QRCodeWriter").init();
        var matrixToImageWriter = createObject("java","com.google.zxing.client.j2se.MatrixToImageWriter");
        var QRCode = QRCodeWriter.encode( data, barcodeFormat.QR_CODE, "400", "400" );

        return matrixToImageWriter.toBufferedImage( QRcode );

    }

```

You can see [my full version here](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/models/security/OneTimePasswordService.cfc).

### Data Model

I added two new database columns to the user table one to flag if the user has 2FA enabled and another to store the users randomly generated shared key used for generating and verifying TOTP. 

```sql
ALTER TABLE [user] ADD two_factor_auth_enabled bit;
ALTER TABLE [user] ADD two_factor_auth_key nvarchar(50);
```

I  modified the `User` model components to use the two new properties.

### Settings / Registration

I created a new set of handler actions and views so the user can see the status of their settings as well as a link to enable or disable 2FA.

![Enable 2FA](https://static.jasonsteinshouer.com/images/2fa/2FA-settings.png)

Clicking on the Enable link will call the `settings.setupTwoFactorAuthentication` action. This action will generate a shared key for the user and also a QR code that the user can scan to set up a profile in their TOTP client application.

```cfscript
prc.user.setTwoFactorAuthenticationKey( oneTimePasswordService.generateKey() );

userService.save( prc.user );

prc.qrCodeImage = oneTimePasswordService.getOTPQRCode(
	name = "Recipe Box (#prc.user.getUsername()#)", 
	key = prc.user.getTwoFactorAuthenticationKey() 
);

event.setView(view="settings/setup");
```

Here is the view rendered in the browser.

![2FA Setup: Enter Code](https://static.jasonsteinshouer.com/images/2fa/2FA-setup.png)

For this demo, I am using the Google Authenticator mobile application for generating TOTP codes on my mobile device. In the Google Authenticator app, I Add a new account and scan the barcode.

<img src="https://static.jasonsteinshouer.com/images/2fa/2FA-authenticator-2.png" style="height: 450px" alt="Google Authenticator: Add Account">

<img src="https://static.jasonsteinshouer.com/images/2fa/2FA-authenticator-3.png" style="height: 450px" alt="Google Authenticator: Scan barcode">

Then I see that my account was added and should see the TOTP code for my account.

<img src="https://static.jasonsteinshouer.com/images/2fa/2FA-authenticator-4.png" style="height: 450px" alt="Google Authenticator: account added">

I then enter that code into the setup form and click Verify Code.

![Verify code](https://static.jasonsteinshouer.com/images/2fa/2FA-setup-enter-code.png)

This will call the `settings.enableTwoFactorAuthentication` handler action to verify the code entered is valid before enabling the 2FA service for the user.

```cfscript
public void function enableTwoFactorAuthentication(event,rc,prc) {
	prc.user = securityService.getLoggedInUser();
	event.paramValue("passcode","");

	if ( !prc.user.isTwoFactorAuthenticationEnabled() ) {
		var key = prc.user.getTwoFactorAuthenticationKey();

		if ( len( rc.passcode ) && oneTimePasswordService.verify( key, rc.passcode )  ) {

			prc.user.setTwoFactorAuthenticationenabled( true );
			userService.save( prc.user );
			flash.put("message","2-Factor authentication setup successful.");
			
		}
		else {
			prc.user.setTwoFactorAuthenticationEnabled( false );
			prc.user.setTwoFactorAuthenticationKey( "" );
			userService.save( prc.user );
			flash.put("message","2-Factor authentication setup failed.");
		}
	}

	setNextEvent("settings");
}
```

If the code was valid the user should see a message confirming that 2FA is enabled.

![Confirmation](https://static.jasonsteinshouer.com/images/2fa/2FA-setup-complete.png)

### Authentication Process

I have modified the authentication process to now check to see if a user has 2FA enabled. The authentication code is located in `handlers/Security.cfc`. When the user enters their username/password combination the handler validates them using the SecurityService component `checkUsernameAndPassword()` method. It checks to see if the user has 2FA enabled and sets the session variable `step2Required`, otherwise the user is authenticated.

**securityService.checkUsernameAndPassword()**

```cfscript
if (
	q.recordCount
	&& passwordService.checkPassword(arguments.password,q.password)
) {			
		
	sessionStorage.setVar( "step1Valid",true );
	var user = userService.get( q.p_user );
	sessionStorage.setVar( "user", user );

	if ( user.isTwoFactorAuthenticationEnabled() ) {
		sessionStorage.setVar( "step2Required",true );
	}
	else {
		sessionStorage.setVar( "isLoggedIn",true );
		sessionRotate();
	}

	isValid = true;
}
```

If they are using 2FA they will see another prompt to enter their TOTP code. Then they will need to open the Google Authenticator to get the code. 

<img src="https://static.jasonsteinshouer.com/images/2fa/2FA-authenticator-5.png" style="height: 450px" alt="Google Authenticator: Get TOTP">

Then they enter it into the authentication form and click Verify Code.

![Verify Code](https://static.jasonsteinshouer.com/images/2fa/2FA-step2b.png)

This will call the `verifyCode` action on the Security handler. This handler then calls the `verifyOneTimePassword()` method on the SecurityService component and will authenticate the user, if the TOTP code is correct.

```cfscript
public boolean function verifyOneTimePassword( required string password ) {

	var user = getLoggedInUser();
	
	var isValid = oneTimePasswordService.verify( 
		key = user.getTwoFactorAuthenticationKey(), 
		userToken = arguments.password 
    );
	
	if ( isValid ) {
		sessionStorage.setVar("isLoggedIn",true);
		sessionRotate();
	}

	return isValid;
}
```

You can view the entire [Security handler here](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/handlers/Security.cfc) and the [SecurityService component here](https://github.com/jsteinshouer/owasp-demo-cfml/blob/master/models/security/SecurityService.cfc).

One thing I did not cover was a way to recover an account in the event that the mobile device was lost or damaged. Even though I am not covering it in this example it should be implemented so user's do not get locked out of their accounts.

I wanted to try and document this as part of my continued exloration and learning of application security. I have a demo application I have been using to implement some of the application security concepts that I am learning. If anyone is interested you can find the full project on [Github](https://github.com/jsteinshouer/owasp-demo-cfml).