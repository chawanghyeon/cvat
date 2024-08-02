import { StorageLocation } from './enums';

export interface StorageData {
    location: StorageLocation;
    cloudStorageId?: number;
}

interface StorageJsonData {
    location: StorageLocation;
    cloud_storage_id?: number;
}

export class Storage {
    public location: StorageLocation;
    public cloudStorageId: number;

    constructor(initialData: StorageData) {
        const data: StorageData = {
            location: initialData ? initialData.location : StorageLocation.LOCAL,
            cloudStorageId: initialData?.cloudStorageId,
        };

        Object.defineProperties(
            this,
            Object.freeze({
                location: {
                    get: () => data.location,
                },
                cloudStorageId: {
                    get: () => data.cloudStorageId,
                },
            }),
        );
    }
    toJSON(): StorageJsonData {
        return {
            location: this.location,
            ...(this.cloudStorageId ? {
                cloud_storage_id: this.cloudStorageId,
            } : {}),
        };
    }
}
