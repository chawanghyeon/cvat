import React from 'react';
import Image from 'antd/lib/image';
import Paragraph from 'antd/lib/typography/Paragraph';
import Text from 'antd/lib/typography/Text';

interface Props {
    name?: string;
    gif?: string;
    message?: string;
    withNegativePoints?: boolean;
}

function InteractorTooltips(props: Props): JSX.Element {
    const {
        name, gif, message, withNegativePoints,
    } = props;
    const UNKNOWN_MESSAGE = 'Selected interactor does not have a help message';
    const desc = message || UNKNOWN_MESSAGE;
    return (
        <div className='cvat-interactor-tip-container'>
            {name ? (
                <>
                    <Paragraph>{desc}</Paragraph>
                    <Paragraph>
                        <Text>You can prevent server requests holding</Text>
                        <Text strong>{' Ctrl '}</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text>Positive points can be added by left-clicking the image.</Text>
                        {withNegativePoints ? (
                            <Text>Positive points can be deleted by right-clicking the image. </Text>
                        ) : null}
                    </Paragraph>
                    <Paragraph>
                        <Text>Press the 9 or 0 key to change the label.</Text>
                        <br />
                        <Text>Press the I key to create the object.</Text>
                        <br />
                        <Text>Press the U key to activated.</Text>
                        <br />
                        <Text>Press the O key to disabled.</Text>
                        <br />
                        <Text>Press the P / Delete key to delete the object.</Text>
                    </Paragraph>
                    {gif ? <Image className='cvat-interactor-tip-image' alt='Example gif' src={gif} /> : null}
                </>
            ) : (
                <Text>Check the guide</Text>
            )}
        </div>
    );
}

export default React.memo(InteractorTooltips);
