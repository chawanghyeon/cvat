import './styles.scss';
import React, { RefObject } from 'react';

import { RcFile } from 'antd/lib/upload';
import { TreeNodeNormal } from 'antd/lib/tree/Tree';
import { FormInstance } from 'antd/lib/form';

import { CloudStorage } from 'reducers';
import LocalFiles from './local-files';

export interface Files {
    local: File[];
    share: string[];
    remote: string[];
    cloudStorage: string[];
}

interface State {
    files: Files;
    active: 'local' | 'share' | 'remote' | 'cloudStorage';
    cloudStorage: CloudStorage | null;
}

interface Props {
    treeData: (TreeNodeNormal & { mime_type: string })[];
    share: any;
    many: boolean;
    onLoadData: (key: string) => Promise<any>;
    onChangeActiveKey(key: string): void;
    onUploadLocalFiles(files: File[]): void;
}

export class FileManager extends React.PureComponent<Props, State> {
    private cloudStorageTabFormRef: RefObject<FormInstance>;

    public constructor(props: Props) {
        super(props);
        this.cloudStorageTabFormRef = React.createRef<FormInstance>();
        const { onLoadData } = this.props;

        this.state = {
            files: {
                local: [],
                share: [],
                remote: [],
                cloudStorage: [],
            },
            cloudStorage: null,
            active: 'local',
        };

        onLoadData('/');
    }

    public getCloudStorageId(): number | null {
        const { cloudStorage } = this.state;
        return cloudStorage?.id || null;
    }

    public getFiles(): Files {
        const { active, files } = this.state;
        return {
            local: active === 'local' ? files.local : [],
            share: active === 'share' ? files.share : [],
            remote: active === 'remote' ? files.remote : [],
            cloudStorage: active === 'cloudStorage' ? files.cloudStorage : [],
        };
    }

    public reset(): void {
        const { active } = this.state;
        if (active === 'cloudStorage') {
            this.cloudStorageTabFormRef.current?.resetFields();
        }
        this.setState({
            active: 'local',
            files: {
                local: [],
                share: [],
                remote: [],
                cloudStorage: [],
            },
            cloudStorage: null,
        });
    }

    private renderLocalSelector(): JSX.Element {
        const { many, onUploadLocalFiles } = this.props;
        const { files } = this.state;

        return (
            <div className='cvat-upload-drag'>
                <LocalFiles
                    files={files.local}
                    many={many}
                    onUpload={(_: RcFile, newLocalFiles: RcFile[]): boolean => {
                        this.setState({
                            files: {
                                ...files,
                                local: newLocalFiles,
                            },
                        });
                        onUploadLocalFiles(newLocalFiles);
                        return false;
                    }}
                />
            </div>
        );
    }

    public render(): JSX.Element {
        return (
            <>
                {this.renderLocalSelector()}
            </>
        );
    }
}

export default FileManager;
