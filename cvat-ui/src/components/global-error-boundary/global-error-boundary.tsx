import './styles.scss';
import React from 'react';
import { connect } from 'react-redux';
import Result from 'antd/lib/result';
import Text from 'antd/lib/typography/Text';
import Paragraph from 'antd/lib/typography/Paragraph';
import Collapse from 'antd/lib/collapse';
import TextArea from 'antd/lib/input/TextArea';
import ErrorStackParser from 'error-stack-parser';
import { ThunkDispatch } from 'utils/redux';
import { resetAfterErrorAsync } from 'actions/boundaries-actions';
import { CombinedState } from 'reducers';
import logger, { LogType } from 'cvat-logger';
import { Button } from 'antd';

interface OwnProps {
    children: JSX.Element;
}

interface StateToProps {
    job: any | null;
}

interface DispatchToProps {
    restore(): void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            job: { instance: job },
        },
    } = state;

    return {
        job,
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch): DispatchToProps {
    return {
        restore(): void {
            dispatch(resetAfterErrorAsync());
        },
    };
}

type Props = StateToProps & DispatchToProps & OwnProps;
class GlobalErrorBoundary extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const { job } = this.props;
        const parsed = ErrorStackParser.parse(error);

        const logPayload = {
            filename: parsed[0].fileName,
            line: parsed[0].lineNumber,
            message: error.message,
            column: parsed[0].columnNumber,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        };

        if (job) {
            job.logger.log(LogType.exception, logPayload);
        } else {
            logger.log(LogType.exception, logPayload);
        }
    }

    public render(): React.ReactNode {
        const { hasError, error } = this.state;

        if (hasError && error) {
            const message = `${error.name}\n${error.message}\n\n${error.stack}`;
            return (
                <div className='cvat-global-boundary'>
                    <Result
                        status='500'
                        title='Something went error'
                        subTitle={`Error message : ${error.message}`}
                        extra={(
                            <Button type='primary' onClick={() => window.location.replace('/')}>
                                Back Home
                            </Button>
                        )}
                    >
                        <div>
                            <Paragraph>
                                <Paragraph strong>What should I do?</Paragraph>
                                <Text type='danger'>Check how to use SALMON</Text>
                                <br />
                                <Text type='danger'>If you can&apos;t solve it , please send a detail error message to ehehwhdwhd@agilegrowth.co.kr . </Text>
                                <br />
                                <br />
                                <Paragraph strong>What has happened?</Paragraph>
                                <Collapse accordion style={{ background: '#cacaca' }}>
                                    <Collapse.Panel header='Detail error message' key='errorMessage' style={{ background: '#cacaca' }}>
                                        <Text type='danger'>
                                            <TextArea
                                                style={{ background: '#cacaca' }}
                                                className='cvat-global-boundary-error-field'
                                                autoSize
                                                value={message}
                                            />
                                        </Text>
                                    </Collapse.Panel>
                                </Collapse>
                            </Paragraph>
                        </div>
                    </Result>
                </div>
            );
        }

        const { children } = this.props;
        return children;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalErrorBoundary);
