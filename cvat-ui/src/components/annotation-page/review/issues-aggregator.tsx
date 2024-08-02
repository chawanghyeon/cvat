import './styles.scss';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { CombinedState } from 'reducers';
import { Canvas } from 'cvat-canvas/src/typescript/canvas';

import { commentIssueAsync, resolveIssueAsync, reopenIssueAsync } from 'actions/review-actions';

import CreateIssueDialog from './create-issue-dialog';
import HiddenIssueLabel from './hidden-issue-label';
import IssueDialog from './issue-dialog';

export default function IssueAggregatorComponent(): JSX.Element | null {
    const dispatch = useDispatch();
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
    const frameIssues = useSelector((state: CombinedState): any[] => state.review.frameIssues);
    const issuesHidden = useSelector((state: CombinedState): boolean => state.review.issuesHidden);
    const issuesResolvedHidden = useSelector((state: CombinedState): boolean => state.review.issuesResolvedHidden);
    const canvasInstance = useSelector((state: CombinedState) => state.annotation.canvas.instance);
    const canvasIsReady = useSelector((state: CombinedState): boolean => state.annotation.canvas.ready);
    const newIssuePosition = useSelector((state: CombinedState): number[] | null => state.review.newIssuePosition);
    const issueFetching = useSelector((state: CombinedState): number | null => state.review.fetching.issueId);
    const [geometry, setGeometry] = useState<Canvas['geometry'] | null>(null);
    const issueLabels: JSX.Element[] = [];
    const issueDialogs: JSX.Element[] = [];
    const positionMap = new Map<number, number>();

    useEffect(() => {
        if (canvasInstance instanceof Canvas) {
            const { geometry: updatedGeometry } = canvasInstance;
            setGeometry(updatedGeometry);

            const geometryListener = (): void => {
                setGeometry(canvasInstance.geometry);
            };

            canvasInstance.html().addEventListener('canvas.zoom', geometryListener);
            canvasInstance.html().addEventListener('canvas.fit', geometryListener);
            canvasInstance.html().addEventListener('canvas.reshape', geometryListener);

            return () => {
                canvasInstance.html().removeEventListener('canvas.zoom', geometryListener);
                canvasInstance.html().removeEventListener('canvas.fit', geometryListener);
                canvasInstance.html().addEventListener('canvas.reshape', geometryListener);
            };
        }

        return () => {};
    }, [canvasInstance]);

    useEffect(() => {
        if (canvasInstance instanceof Canvas) {
            type IssueRegionSet = Record<number, { hidden: boolean; points: number[] }>;
            const regions = !issuesHidden
                ? frameIssues
                      .filter((_issue: any) => !issuesResolvedHidden || !_issue.resolved)
                      .reduce((acc: IssueRegionSet, issue: any): IssueRegionSet => {
                          acc[issue.id] = {
                              points: issue.position,
                              hidden: issue.resolved,
                          };
                          return acc;
                      }, {})
                : {};

            if (newIssuePosition) {
                // regions[0] is always empty because key is an id of an issue (<0, >0 are possible)
                regions[0] = {
                    points: newIssuePosition,
                    hidden: false,
                };
            }

            canvasInstance.setupIssueRegions(regions);

            if (newIssuePosition) {
                setExpandedIssue(null);
                const element = window.document.getElementById('cvat_canvas_issue_region_0');
                if (element) {
                    element.style.display = 'block';
                }
            }
        }
    }, [newIssuePosition, frameIssues, issuesResolvedHidden, issuesHidden, canvasInstance]);

    useEffect(() => {
        function handleOutsideClick(event) {
            const issueDialogElement = document.querySelector('.cvat-issue-dialog');
            const clickedElement = event.target;

            // 클릭한 요소가 .cvat-issue-dialog의 자식 요소인지 여부를 확인
            const isClickedInsideIssueDialog = issueDialogElement && issueDialogElement.contains(clickedElement);

            // 클릭한 요소가 .cvat-issue-dialog의 자식 요소가 아닌 경우에만 닫기 동작 수행
            if (!isClickedInsideIssueDialog) {
                // 닫기 동작 실행
                setExpandedIssue(null); // 예시로, 닫기 동작을 실행하는 함수 호출
            }
        }

        document.addEventListener('click', handleOutsideClick);

        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [expandedIssue]); // expandedIssue가 변경될 때마다 useEffect가 재실행되도록 설정

    if (!(canvasInstance instanceof Canvas) || !canvasIsReady || !geometry) {
        return null;
    }

    for (const issue of frameIssues) {
        if (issuesHidden) break;
        const issueResolved = issue.resolved;
        if (issuesResolvedHidden && issueResolved) continue;

        const { id } = issue;
        const offset = 15;

        const translated = issue.position.map((coord: number): number => coord + geometry.offset);
        const minX = Math.min(...translated.filter((_: number, idx: number): boolean => idx % 2 === 0));
        const minY = Math.min(...translated.filter((_: number, idx: number): boolean => idx % 2 !== 0));
        const maxX = Math.max(...translated.filter((_: number, idx: number): boolean => idx % 2 === 0));
        const maxY = Math.max(...translated.filter((_: number, idx: number): boolean => idx % 2 !== 0));
        const offsetWidth = (maxX - minX) / 2.0;
        const offsetHeight = (maxY - minY) / 2.0;
        let hiddenX = 2.0;
        let hiddenY = 2.0;
        let hiddenOffsetWidth = (maxX - minX) / hiddenX;
        let hiddenOffsetHeight = (maxX - minX) / hiddenY;

        const highlight = (): void => {
            const element = window.document.getElementById(`cvat_canvas_issue_region_${id}`);
            if (element) {
                element.style.display = 'block';
            }
        };

        const blur = (): void => {
            if (issueResolved) {
                const element = window.document.getElementById(`cvat_canvas_issue_region_${id}`);
                if (element) {
                    element.style.display = 'none';
                }
            }
        };

        if (expandedIssue === id) {
            issueDialogs.push(
                <IssueDialog
                    key={issue.id}
                    issue={issue}
                    top={minY + offsetHeight}
                    left={minX + offsetWidth}
                    angle={-geometry.angle}
                    scale={1 / geometry.scale}
                    isFetching={issueFetching !== null}
                    resolved={issueResolved}
                    highlight={highlight}
                    blur={blur}
                    collapse={() => {
                        setExpandedIssue(null);
                    }}
                    resolve={() => {
                        dispatch(resolveIssueAsync(issue.id));
                        setExpandedIssue(null);
                    }}
                    reopen={() => {
                        dispatch(reopenIssueAsync(issue.id));
                    }}
                    comment={(message: string) => {
                        dispatch(commentIssueAsync(issue.id, message));
                    }}
                />,
            );
        } else if (issue.comments.length) {
            let positionNumber = 0;
            const positionSum = minY + hiddenOffsetHeight - offset;
            if (!positionMap.has(positionSum)) positionMap.set(positionSum, 0);
            else {
                positionNumber = Number(positionMap.get(positionSum)) + 1;
                positionMap.set(positionSum, positionNumber);
            }

            if (positionNumber === 1) {
                hiddenX = 1.4;
                hiddenOffsetWidth = (maxX - minX) / hiddenX;
                hiddenY = 7.0;
                hiddenOffsetHeight = (maxX - minX) / hiddenY;
            }
            if (positionNumber === 2) {
                hiddenX = 1.4;
                hiddenOffsetWidth = (maxX - minX) / hiddenX;
                hiddenY = 1.2;
                hiddenOffsetHeight = (maxX - minX) / hiddenY;
            }
            if (positionNumber === 3) {
                hiddenX = 10.0;
                hiddenOffsetWidth = (maxX - minX) / hiddenX;
                hiddenY = 1.2;
                hiddenOffsetHeight = (maxX - minX) / hiddenY;
            }
            if (positionNumber === 4) {
                hiddenX = 10.0;
                hiddenOffsetWidth = (maxX - minX) / hiddenX;
                hiddenY = 7.0;
                hiddenOffsetHeight = (maxX - minX) / hiddenY;
            }

            issueLabels.push(
                <HiddenIssueLabel
                    key={issue.id}
                    issue={issue}
                    top={minY + hiddenOffsetHeight - offset}
                    left={minX + hiddenOffsetWidth}
                    angle={-geometry.angle}
                    scale={1 / geometry.scale}
                    resolved={issueResolved}
                    highlight={highlight}
                    blur={blur}
                    onClick={() => {
                        setExpandedIssue(id);
                    }}
                />,
            );
        }
    }
    positionMap.clear();

    const translated = newIssuePosition ? newIssuePosition.map((coord: number): number => coord + geometry.offset) : [];
    const createLeft = translated.length
        ? Math.min(...translated.filter((_: number, idx: number): boolean => idx % 2 === 0))
        : null;
    const createTop = translated.length
        ? Math.max(...translated.filter((_: number, idx: number): boolean => idx % 2 !== 0))
        : null;

    return (
        <>
            {createLeft !== null && createTop !== null ? (
                <CreateIssueDialog
                    top={createTop}
                    left={createLeft}
                    angle={-geometry.angle}
                    scale={1 / geometry.scale}
                />
            ) : null}
            {issueDialogs}
            {issueLabels}
        </>
    );
}
