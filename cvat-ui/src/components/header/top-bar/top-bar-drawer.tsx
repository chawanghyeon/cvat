import React, { useState, useCallback, useEffect } from 'react';
import {
    Button, Drawer, Card, Empty,
} from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { InfoIcon } from 'icons';
import { CombinedState } from 'reducers';
import { useDispatch, useSelector } from 'react-redux';
import { getJobGuideAsync } from 'actions/jobs-actions';

const TopBarDrawer = (): JSX.Element => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const projectId = useSelector((state: CombinedState) => state.annotation.job?.instance?.projectId);
    const guides = useSelector((state: CombinedState) => state.jobs.guide);

    useEffect(() => {
        if (projectId > 0) dispatch(getJobGuideAsync(projectId));
    }, [projectId]);

    const handleShowDrawer = useCallback(():void => {
        setOpen(true);
    }, [open]);

    const handleCloseDrawer = useCallback(():void => {
        setOpen(false);
    }, [open]);

    return (
        <>
            <Button
                type='text'
                icon={<Icon component={InfoIcon} />}
                onClick={handleShowDrawer}
            />
            <Drawer title='Salmon Guide' placement='right' onClose={handleCloseDrawer} open={open}>
                {guides.length > 0 ? (
                    guides.map((guide, idx) => (
                        <a key={idx} href={guide.file} target='_blank' rel='noopener noreferrer'>
                            <Card
                                hoverable
                                cover={<img alt='Guide Line' src='https://www.notion.so/images/meta/default.png' />}
                            >
                                <Card.Meta description={` Guide Line ${guide.id}`} />
                            </Card>
                        </a>
                    ))
                ) : (<Empty />)}
            </Drawer>
        </>
    );
};

export default TopBarDrawer;
