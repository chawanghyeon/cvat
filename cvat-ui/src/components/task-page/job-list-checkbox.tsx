import React from 'react';
import { Checkbox } from 'antd';

interface Props {
    etc: boolean;
    jid: number;
    onUpdateJob(jobInstance: any): void;
    jobs: any;
}

const JobListCheckBox = ({
    etc, jid, onUpdateJob, jobs,
}: Props): JSX.Element => {
    const onChange = (): void => {
        const updateJob = jobs.filter((j: any) => j.id === jid);
        if (updateJob[0]?.etc === true) updateJob[0].etc = false;
        else if (updateJob[0]?.etc === false) updateJob[0].etc = true;

        onUpdateJob(updateJob[0]);
    };

    return (
        <Checkbox
            checked={etc}
            onChange={onChange}
        />
    );
};

export default JobListCheckBox;
