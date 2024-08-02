import React from 'react';

export default function AuthenticationProviderIcon({ iconData, provider }: {
    iconData: string,
    provider: string
}): JSX.Element {
    return (
        <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(iconData)}`}
            alt={provider}
            className='cvat-social-authentication-icon'
        />
    );
}
