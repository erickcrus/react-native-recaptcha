# reCAPTCHA for React Native (Android and iOS)

A reCAPTCHA library for React Native (Android and iOS) that works. This lib was forked from react-native-recaptcha-that-works, but was fully rewrite for my use propouse.

| Normal | Invisible |
| - | - |
| <img src='https://raw.githubusercontent.com/douglasjunior/react-native-recaptcha-that-works/master/screenshots/normal.gif' width='240' /> | <img src='https://raw.githubusercontent.com/douglasjunior/react-native-recaptcha-that-works/master/screenshots/invisible.gif' width='240' /> |

_Looking for [React DOM version](https://github.com/douglasjunior/react-recaptcha-that-works)?_

## Install 

### Install the module 
```bash
  npm i -S @erickcrus/react-native-recaptcha react-native-webview react-native-reanimated
```

_See the [`react-native-webview` Getting Started Guide](https://github.com/react-native-community/react-native-webview/blob/master/docs/Getting-Started.md)._
_See the [`react-native-reanimated` Getting Started Guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)._

## Usage

With <strong>JavaScript</strong>:

```jsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';

import Recaptcha from 'react-native-recaptcha';

const App = () => {
    const recaptcha = useRef();

    const send = () => {
        console.log('send!');
        this.recaptcha.current.open();
    }

    const onVerify = token => {
        console.log('success!', token);
    }

    const onExpire = () => {
        console.warn('expired!');
    }

    return (
        <View>
            <Recaptcha
                ref={recaptcha}
                hideBadge={true}
                hideLoader={true}
                siteKey="<your-recaptcha-public-key>"
                baseUrl="http://my.domain.com"
                onVerify={onVerify}
                onExpire={onExpire}
                size="invisible"
            />
            <Button title="Send" onPress={send} />
        </View>
    );
}
```

<details>
    <summary>Or with <strong>TypeScript</strong>:</summary>
  
```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';

import Recaptcha, { RecaptchaHandles } from "react-native-recaptcha";

// ...

export const Component: React.FC = () => {
    const recaptcha = useRef<RecaptchaHandles>();

    const send = () => {
        console.log('send!');
        recaptcha.current?.open();
    };

    const onVerify = (token: string) => {
        console.log('success!', token);
    };

    const onExpire = () => {
        console.warn('expired!');
    }

    return (
        <View>
            <Recaptcha
                ref={recaptcha}
                siteKey="<your-recaptcha-public-key>"
                baseUrl="http://my.domain.com"
                onVerify={onVerify}
                onExpire={onExpire}
                size="invisible"
            />
            <Button title="Send" onPress={send} />
        </View>
    );
};
```
</details>

<br />

For more details, see the [Sample Project](https://github.com/douglasjunior/react-native-recaptcha-that-works/blob/master/Sample/src/App.js) or try the [Online demo](https://snack.expo.dev/@douglasjunior/react-native-recaptcha-that-works).

## Props

|Name|Value|Default|Description|
|-|-|-|-|
|headerComponent|`React Element`||A component to render on top of Modal.|
|footerComponent|`React Element`||A component to render on bottom of Modal.|
|loadingComponent|`React Element`||A custom loading component.|
|webViewProps|[WebViewProps](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md)||Override the WebView props.|
|onVerify|`function(token)`||(Required) A callback function, executed when the user submits a successful response. The reCAPTCHA response token is passed to your callback.|
|onExpire|`function()`||A callback function, executed when the reCAPTCHA response expires and the user needs to re-verify.|
|onError|`function(error)`||A callback function, executed when reCAPTCHA encounters an error (usually network connectivity) and cannot continue until connectivity is restored. If you specify a function here, you are responsible for informing the user that they should retry.|
|onClose|`function()`|| A callback function, executed when the Modal is closed.|
|theme|`'dark'` or `'light'`|`'light'`|The color theme of the widget.|
|size|`'invisible'`, `'normal'` or `'compact'`|`'normal'`|The size of the widget.|
|siteKey|`string`||(Required) Your sitekey.|
|hideBadge|`boolean`||(Opitional) Hide the google badge|
|hideLoader|`boolean`||(Opitional) Hide the loading animation|
|baseUrl|`string`||(Required) The URL (domain) configured in the reCAPTCHA setup. (ex. http://my.domain.com)|
|lang|`string`||[Language code](https://developers.google.com/recaptcha/docs/language).|
|style|[`ViewStyle`](https://reactnative.dev/docs/view-style-props)||Customize default style such as background color.|
|enterprise|`boolean`|`false`| (Experimental) Use the new [reCAPTCHA Enterprise API](https://cloud.google.com/recaptcha-enterprise/docs/using-features).|

Note: If `lang` is not set, then device language is used.

## Methods

|Name|Type|Description|
|-|-|-|
|open|`function`|Open the reCAPTCHA Modal.|
|close|`function`|Close the reCAPTCHA Modal.|

Note: If using `size="invisible"`, then challenge run automatically when `open` is called.

## reCAPTCHA v2 docs

- [I'm not a robot](https://developers.google.com/recaptcha/docs/display)
- [Invisible](https://developers.google.com/recaptcha/docs/invisible)

## reCAPTCHA Enterprise docs

- [Overview](https://cloud.google.com/recaptcha-enterprise/docs/)
- [Using features](https://cloud.google.com/recaptcha-enterprise/docs/using-features)

## Contribute

New features, bug fixes and improvements are welcome! For questions and suggestions, use the [issues](https://github.com/douglasjunior/react-native-recaptcha-that-works/issues).

<a href="https://www.patreon.com/douglasjunior"><img src="http://i.imgur.com/xEO164Z.png" alt="Become a Patron!" width="200" /></a>
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=E32BUP77SVBA2)

## License

```
The MIT License (MIT)

Copyright (c) 2020 Douglas Nassif Roma Junior
```

See the full [license file](https://github.com/douglasjunior/react-native-recaptcha-that-works/blob/master/LICENSE).
