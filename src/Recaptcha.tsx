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

import React, {
    forwardRef,
    useMemo,
    useState,
    useCallback,
    useRef,
    useImperativeHandle,
    memo,
    ReactNode,
    useEffect,
} from 'react';
import {
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    View,
    StyleProp,
    ViewStyle
} from 'react-native';

const { width, height } = Dimensions.get('window');

import WebView, { WebViewMessageEvent, WebViewProps } from 'react-native-webview';
import getTemplate, { RecaptchaSize, RecaptchaTheme } from './get-template';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { OnShouldStartLoadWithRequest } from 'react-native-webview/lib/WebViewTypes';

const styles = StyleSheet.create({
    webView: {
        width, height
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const originWhitelist = ['*'];

export type RecaptchaRef = {
    open(): void;
    close(): void;
};

export type RecaptchaProps = {
    /**
     * A component to render on top of Modal.
     */
    headerComponent?: ReactNode;
    /**
     * A component to render on bottom of Modal.
     */
    footerComponent?: ReactNode;
    /**
     * A custom loading component.
     */
    loadingComponent?: ReactNode;
    /**
     * Customize default style such as background color.
     *
     * Ref: https://reactnative.dev/docs/view-style-props
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Override the WebView props.
     *
     * Ref: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md
     */
    webViewProps?: Omit<WebViewProps, 'source' | 'style' | 'onMessage' | 'ref'>;
    /**
     * Language code.
     *
     * Ref: https://developers.google.com/recaptcha/docs/language
     */
    lang?: string;
    /**
     * Your Web reCAPTCHA site key. (The Web key must be used, not for Android)
     */
    siteKey: string;
    /**
     * The URL (domain) configured in the reCAPTCHA console setup. (ex. http://my.domain.com)
     */
    baseUrl: string;
    /**
     * The size of the widget.
     */
    size?: RecaptchaSize;
    /**
     * The color theme of the widget.
     */
    theme?: RecaptchaTheme;
    /**
     * A callback function, executed when the user submits a successful response.
     *
     * The reCAPTCHA response token is passed to your callback.
     */
    onVerify: (token: string) => void;
    /**
     * A callback function, executed when the reCAPTCHA response expires and the user needs to re-verify.
     *
     * Only works if the `webview` still open after `onVerify` has been called for a long time.
     */
    onExpire?: () => void;
    /**
     * A callback function, executed when reCAPTCHA encounters an error (usually network connectivity)
     * and cannot continue until connectivity is restored.
     *
     * If you specify a function here, you are responsible for informing the user that they should retry.
     */
    onError?: (error: any) => void;
    /**
     * A callback function, executed when the Modal is closed.
     */
    onClose?: () => void;
    /**
     * When `size = 'invisible'`, you are allowed to hide the badge as long as you include the
     * reCAPTCHA branding visibly in the user flow.
     *
     * Ref: https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed
     */
    hideBadge?: boolean;
    /**
     * hide loader
     */
    hideLoader?: boolean;
    /**
     * Use the new [reCAPTCHA Enterprise API](https://cloud.google.com/recaptcha-enterprise/docs/using-features).
     */
    enterprise?: boolean;
    /**
     * Ativar debug
     */
    debug?: boolean;

    /**
     * Timeout para expirar o recaptcha
     */
    timeout?: number;
};

const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>((props, $ref) => {
    const {
        headerComponent,
        footerComponent,
        loadingComponent,
        style,
        webViewProps,
        lang,
        siteKey,
        baseUrl,
        size,
        theme,
        onVerify,
        onExpire,
        onError,
        onClose,
        hideBadge,
        hideLoader,
        enterprise,
        debug,
        timeout: _timeout,
    } = props;

    const $webView = useRef<WebView>(null);
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState(true);
    const captchaLoaded = useRef(false);

    useEffect(() => {
        captchaLoaded.current = false;
        return () => {
            captchaLoaded.current = false;
        }
    }, []);

    const containerOpacity = useSharedValue(0);
    const containerZIndex = useSharedValue(-1000);

    const containerStyles = useAnimatedStyle(() => ({
        position: 'absolute',
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: containerZIndex.value,
        opacity: containerOpacity.value,
    }), [ containerOpacity, containerZIndex ]);

    const html = useMemo(() => getTemplate({
        hideBadge,
        siteKey,
        size,
        theme,
        lang,
        debug
    }, enterprise), [hideBadge, siteKey, size, theme, lang, enterprise]);

    const handleMessage = useCallback((content: WebViewMessageEvent) => {
        if(timeout.current) clearTimeout(timeout.current);
        
        try {
            const payload = JSON.parse(content.nativeEvent.data);
            if(payload.verify) {
                handleClose();
                onVerify && onVerify(payload.verify);
            }
            if(payload.expired) {
                handleClose();
                onExpire && onExpire();
            }
            if(payload.error) {
                handleClose();
                onError && onError(payload.error);
            }
            if(payload.onReady) {
                captchaLoaded.current = true;
            }
        } catch (error) {
            console.warn(error);
        }
    }, []);

    const handleClose = () => {
        containerOpacity.value = 0;
        containerZIndex.value = -1000;
        $webView.current?.injectJavaScript(`
            grecaptcha.reset();
            true;
        `);
        onClose && onClose();
    }

    const handleOpen = () => {
        // prevent expiring if the recaptcha is already loaded
        $webView.current?.injectJavaScript(`
            grecaptcha.reset();
            true;
        `);

        // if the recaptcha dont respond in 30 seconds, the error callback will be called
        timeout.current = setTimeout(() => {
            onError && onError('timeout');
            containerOpacity.value = 0;
            containerZIndex.value = -1000;
            $webView.current?.injectJavaScript(`
                grecaptcha.reset();
                true;
            `);
            setLoading(false);
        }, _timeout ?? 30000);

        // run recaptcha
        containerOpacity.value = 1;
        containerZIndex.value = 100000;
        $webView.current?.injectJavaScript(`
            grecaptcha.execute();
            true;
        `);
        setLoading(true);
    }

    useImperativeHandle($ref, () => ({
        open: handleOpen,
        close: handleClose,
    }), [handleClose, handleOpen, $webView, loading]);

    const handleNavigationStateChange = useCallback(() => {
        // prevent navigation on Android
        if (!loading) {
            $webView.current?.stopLoading();
        }
    }, [loading]);

    const handleShouldStartLoadWithRequest: OnShouldStartLoadWithRequest = useCallback(event => {
        // prevent navigation on iOS
        return event.navigationType === 'other' && event.url !== 'about:blank';
    }, [loading]);

    const webViewStyles = useMemo(() => [
        styles.webView,
        style,
    ], [style]);

    const renderLoading = () => {
        if (!loading || hideLoader) return null;

        return <View style={styles.loadingContainer}>
            {loadingComponent || <ActivityIndicator size="large" />}
        </View>;
    };

    const stopLoading = useCallback(() => setLoading(false), []);

    return (
        <Animated.View style={containerStyles}>
            {headerComponent}
            <WebView bounces={false}
                allowsBackForwardNavigationGestures={false}
                {...webViewProps}
                source={{
                    html,
                    baseUrl,
                }}
                cacheEnabled={false}
                javaScriptEnabled={true}
                onLoadEnd={stopLoading}
                style={webViewStyles}
                originWhitelist={originWhitelist}
                onMessage={handleMessage}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onNavigationStateChange={handleNavigationStateChange}
                ref={$webView}
            />
            {footerComponent}
            {renderLoading()}
        </Animated.View>
    );
});

Recaptcha.defaultProps = {
    size: 'invisible',
    theme: 'light',
    enterprise: false,
};

export default memo(Recaptcha);