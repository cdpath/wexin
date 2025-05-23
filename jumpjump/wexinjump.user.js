// ==UserScript==
// @name         WeChat Redirect Bypass
// @namespace    http://tampermonkey.net/
// @version      2025-05-23
// @description  Automatically bypass WeChat redirect confirmation pages
// @homepage           https://github.com/cdpath/wexin
// @homepageURL        https://github.com/cdpath/wexin
// @match        https://weixin110.qq.com/cgi-bin/mmspamsupport-bin/newredirectconfirmcgi*
// @match        https://weixin110.qq.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('WeChat Redirect Bypass: Script loaded');

    // Extract URL from cgiData in page content
    function extractUrlFromPage() {
        const scripts = document.getElementsByTagName('script');

        for (const script of scripts) {
            const content = script.textContent || script.innerHTML;
            if (content.includes('cgiData')) {
                try {
                    // Extract cgiData object
                    const match = content.match(/var\s+cgiData\s*=\s*({.*?});/s);
                    if (match) {
                        const cgiDataStr = match[1];
                        // Replace HTML entities
                        const cleanedStr = cgiDataStr
                            .replace(/&#x2f;/g, '/')
                            .replace(/&#x3a;/g, ':')
                            .replace(/&#x3f;/g, '?')
                            .replace(/&#x3d;/g, '=')
                            .replace(/&#x26;/g, '&')
                            .replace(/\\'/g, "'");

                        const cgiData = JSON.parse(cleanedStr);

                        // Check url field first
                        if (cgiData.url) {
                            console.log('Found URL in cgiData.url:', cgiData.url);
                            return cgiData.url;
                        }

                        // Check btns array for URL
                        if (cgiData.btns && cgiData.btns.length > 0) {
                            for (const btn of cgiData.btns) {
                                if (btn.url && btn.url.startsWith('http')) {
                                    console.log('Found URL in cgiData.btns:', btn.url);
                                    return btn.url;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('Failed to parse cgiData:', e);
                }
            }
        }
        return null;
    }

    // Main redirect function
    function handleRedirect() {
        const originalUrl = extractUrlFromPage();

        if (originalUrl) {
            console.log('Redirecting to:', originalUrl);
            window.location.href = originalUrl;
        } else {
            console.log('Could not find original URL in page');
        }
    }

    // Run the redirect
    if (window.location.hostname === 'weixin110.qq.com') {
        // Try immediately
        handleRedirect();

        // If that didn't work, try again after a short delay
        setTimeout(() => {
            if (window.location.hostname === 'weixin110.qq.com') {
                handleRedirect();
            }
        }, 500);
    }
})();

