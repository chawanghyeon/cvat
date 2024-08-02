import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal';
import { Row, Col } from 'antd/lib/grid';
import Icon, { CloseOutlined } from '@ant-design/icons';
import Comment from 'antd/lib/comment';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import Button from 'antd/lib/button';
import Spin from 'antd/lib/spin';
import Input from 'antd/lib/input';
import moment from 'moment';
import CVATTooltip from 'components/common/cvat-tooltip';
import { Issue, Comment as CommentModel } from 'cvat-core-wrapper';
import { deleteIssueAsync } from 'actions/review-actions';
import { EnterIcon } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    issue: Issue;
    left: number;
    top: number;
    resolved: boolean;
    isFetching: boolean;
    angle: number;
    scale: number;
    collapse: () => void;
    resolve: () => void;
    reopen: () => void;
    comment: (message: string) => void;
    highlight: () => void;
    blur: () => void;
}

export default function IssueDialog(props: Props): JSX.Element {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const [currentText, setCurrentText] = useState<string>('');
    const dispatch = useDispatch();
    const {
        issue,
        left,
        top,
        scale,
        angle,
        resolved,
        isFetching,
        collapse,
        resolve,
        reopen,
        comment,
        highlight,
        blur,
    } = props;

    const [targetTop, setTargetTop] = useState(() => top);
    const [targetLeft, setTargetLeft] = useState(() => left);
    const [parentSize, setParentSize] = useState({ top: 0, left: 0 });
    const [lastPosition, setLastPosition] = useState<{ top: number; left: number }>({ top, left });

    const [canvasScale, setCanvasScale] = useState(1);
    const { id, comments } = issue;

    useEffect(() => {
        if (!resolved) {
            setTimeout(highlight);
        } else {
            setTimeout(blur);
        }
    }, [resolved]);

    const onDeleteIssue = useCallback((): void => {
        Modal.confirm({
            title: `Issue${id >= 0 ? ` #${id}` : ''} will be deleted.`,
            className: 'cvat-modal-confirm-remove-issue',
            onOk: () => {
                collapse();
                dispatch(deleteIssueAsync(id));
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: 'Delete',
        });
    }, []);

    const lines = comments.map((_comment: CommentModel): JSX.Element => {
        const created = _comment.createdDate ? moment(_comment.createdDate) : moment(moment.now());
        const diff = created.fromNow();

        return (
            <Comment
                avatar={null}
                key={_comment.id}
                author={<Text strong>{_comment.owner ? _comment.owner.username : 'Unknown'}</Text>}
                content={<p>{_comment.message}</p>}
                datetime={
                    <CVATTooltip title={created.format('MMMM Do YYYY')}>
                        <span>{diff}</span>
                    </CVATTooltip>
                }
            />
        );
    });

    useEffect(() => {
        const issueDialogRef = ref.current;

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.intersectionRatio <= 0) {
                    // IssueDialog가 화면에서 사라졌을 때의 로직 추가
                    const { top, left } = entry.boundingClientRect;
                    const deltaX = lastPosition.left - left; // X 축 이동량 계산
                    const deltaY = lastPosition.top - top; // Y 축 이동량 계산

                    console.log('top : ', top);
                    console.log('left : ', left);
                    console.log('deltaX : ', deltaX);
                    console.log('deltaY : ', deltaY);
                    console.log('lastPosition : ', lastPosition);

                    const ttop = lastPosition.top - deltaY;
                    const lleft = lastPosition.left - deltaX;

                    // setLastPosition({ top, left });

                    // 사라진 위치와의 차이에 따라 이전 위치로 되돌아가도록 설정

                    let resultTop = lastPosition.top;
                    let resultLeft = lastPosition.left;
                    if (ttop > 718) {
                        // 아래로 사라진 경우
                        // setTargetTop(lastPosition.top);
                        resultTop -= 215 / 2.4432;
                        console.log('아래로 사라짐 : ', resultTop, resultLeft);
                    } else if (ttop < -100) {
                        // 위로 사라진 경우
                        resultTop += 215 / 2.4432;
                        console.log('위로 사라짐 : ', resultTop, resultLeft);
                        // setTargetTop(lastPosition.top - deltaY);
                    }

                    if (lleft > 1300) {
                        // 오른쪽으로 사라진 경우
                        // setTargetLeft(lastPosition.left);
                        resultLeft -= 230 / 2;
                        console.log('오른쪽로 사라짐 : ', resultTop, resultLeft);
                    } else if (lleft < -220) {
                        // 왼쪽으로 사라진 경우
                        resultLeft += 230 / 2;
                        // setTargetLeft(lastPosition.left - deltaX);
                        console.log('왼쪽으로 사라짐 : ', resultTop, resultLeft);
                    }

                    console.log('result : ', resultTop, resultLeft);
                    setLastPosition({ top: resultTop, left: resultLeft });
                }
            });
        };

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0,
        };

        const observer = new IntersectionObserver(observerCallback, options);

        if (issueDialogRef) {
            observer.observe(issueDialogRef);
        }

        return () => {
            if (issueDialogRef) {
                observer.unobserve(issueDialogRef);
            }
        };
    }, [ref, lastPosition]); // 빈 배열로 수정

    useEffect(() => {
        // 대상 요소와 스타일 속성 이름
        const targetElement: any = document.querySelector('.cvat-issue-dialog');
        const styleAttributeName = 'transform';

        // 스타일 문자열에서 scale 값을 추출하는 정규 표현식
        const scaleRegex = /scale\(([^)]+)\)/;

        // MutationObserver 생성
        const observer = new MutationObserver((mutationsList, observer) => {
            // 모든 변화에 대해 반복
            for (let mutation of mutationsList) {
                // 스타일 속성이 변경된 경우
                if (mutation.type === 'attributes' && mutation.attributeName === styleAttributeName) {
                    const styleString = targetElement.style[styleAttributeName];
                    // 스타일 문자열에서 scale 값을 추출
                    const scaleMatch = styleString.match(scaleRegex);
                    if (scaleMatch) {
                        // scale 값 출력
                        const scaleValue = scaleMatch[1];
                        console.log('Scale value:', scaleValue);
                        setCanvasScale(scaleValue);
                    }
                }
            }
        });

        // MutationObserver를 대상 요소에 연결하고 스타일 변경을 감시
        observer.observe(targetElement, { attributes: true });

        // 컴포넌트가 언마운트될 때 MutationObserver를 해제
        return () => {
            observer.disconnect();
        };
    }, []); // 빈 배열로 수정

    const resolveButton = resolved ? (
        <Button loading={isFetching} className='cvat-issue-dialog-reopen-button' type='primary' onClick={reopen}>
            {t('confirm.open')}
        </Button>
    ) : (
        <Button loading={isFetching} className='cvat-issue-dialog-resolve-button' type='primary' onClick={resolve}>
            {t('confirm.resolve')}
        </Button>
    );

    return ReactDOM.createPortal(
        <div
            style={{
                top: lastPosition.top,
                left: lastPosition.left,
                transform: `scale(${scale}) rotate(${angle}deg)`,
            }}
            ref={ref}
            className='cvat-issue-dialog'
        >
            <Row className='cvat-issue-dialog-header' justify='space-between'>
                <Col>
                    <span>{id >= 0 ? `Issue #${id}` : 'Issue'}</span>
                </Col>
                <Col>
                    <CVATTooltip title='Collapse the chat'>
                        <CloseOutlined onClick={collapse} />
                    </CVATTooltip>
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-chat' justify='start'>
                {lines.length > 0 ? <Col style={{ display: 'block' }}>{lines}</Col> : <Spin />}
            </Row>
            <Row className='cvat-issue-dialog-input' justify='start'>
                <Col span={24}>
                    <Input
                        placeholder={t('modal.Print a comment here')}
                        value={currentText}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setCurrentText(event.target.value);
                        }}
                        onPressEnter={() => {
                            if (currentText) {
                                comment(currentText);
                                setCurrentText('');
                            }
                        }}
                        suffix={<Icon component={EnterIcon} />}
                    />
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-footer' justify='space-between'>
                <Col span={8}>
                    <Button className='cvat-issue-dialog-remove-button' onClick={onDeleteIssue}>
                        {t('confirm.remove')}
                    </Button>
                </Col>
                <Col span={15} offset={1}>
                    {currentText.length ? (
                        <Button
                            className='cvat-issue-dialog-comment-button'
                            loading={isFetching}
                            type='primary'
                            disabled={!currentText.length}
                            onClick={() => {
                                comment(currentText);
                                setCurrentText('');
                            }}
                        >
                            {t('confirm.submit')}
                        </Button>
                    ) : (
                        resolveButton
                    )}
                </Col>
            </Row>
        </div>,
        window.document.getElementById('cvat_canvas_attachment_board') as HTMLElement,
    );
}
