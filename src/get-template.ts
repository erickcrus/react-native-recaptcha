/**
* MIT License
* 
* Copyright (c) 2020 Douglas Nassif Roma Junior
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE. 
*/

export type RecaptchaSize = 'invisible' | 'normal' | 'compact';

export type RecaptchaTheme = 'dark' | 'light';

export type TemplateParams = {
    siteKey: string;
    size?: RecaptchaSize;
    theme?: RecaptchaTheme;
    lang?: string;
    action?: string;
    hideBadge?: boolean;
};

const getTemplate = (params: TemplateParams, enterprise?: boolean) => {
    const { hideBadge, siteKey, size, theme, lang } = params;

    let template = `
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Brasil Bitcoin Captcha</title>
        <script>
            document.addEventListener("message", function(message) {
                const data = JSON.parse(message.data);

                switch(data.action){
                    case 'executeCaptcha':
                        alert('execute');
                        window.grecaptcha.execute();
                        break;
                }
            });

            var onSubmit = function(token) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    verify: token,
                }));
            }

            var onError = function(error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    error: error,
                }));
            }

            var onExpired = function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    expired: 'expired',
                }));
            }

            var onloadCallback = function() {
                grecaptcha.render('submit', {
                    sitekey: '${siteKey}',
                    size: '${size}',
                    theme: '${theme}',
                    callback: onSubmit,
                    'expired-callback': onExpired,
                    'error-callback': onError,
                });
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    onReady: true,
                }));
            }
        </script>
        <style>
            html,
            body,
            .container {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            ${hideBadge ? `.grecaptcha-badge{display:none}` : ''}
        </style>
    </head>
    
    <body>
        <div class="container">
            <div id="submit" class="g-recaptcha"></div>
        </div>
        <script src="https://www.google.com/recaptcha/${ enterprise ? 'enterprise' : 'api'}.js?onload=onloadCallback&render=explicit" async defer></script>
    </body>
    
    </html>`;

    return template;
};

export default getTemplate;