import { Config } from 'react-awesome-query-builder';

export const config: Partial<Config> = {
    fields: {
        dimension: {
            label: 'Dimension',
            type: 'select',
            operators: ['select_equals'],
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: '2d', title: '2D' },
                    { value: '3d', title: '3D' },
                ],
            },
        },
        status: {
            label: 'Status',
            type: 'select',
            valueSources: ['value'],
            operators: ['select_equals', 'select_any_in', 'select_not_any_in'],
            fieldSettings: {
                listValues: [
                    { value: 'annotation', title: 'Annotation' },
                    { value: 'validation', title: 'Validation' },
                    { value: 'completed', title: 'Completed' },
                ],
            },
        },
        mode: {
            label: 'Data',
            type: 'select',
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: 'interpolation', title: 'Video' },
                    { value: 'annotation', title: 'Images' },
                ],
            },
        },
        subset: {
            label: 'Subset',
            type: 'text',
            valueSources: ['value'],
            operators: ['equal'],
        },
        assignee: {
            label: 'Assignee',
            type: 'text',
            valueSources: ['value'],
            operators: ['equal'],
        },
        owner: {
            label: 'Owner',
            type: 'text',
            valueSources: ['value'],
            operators: ['equal'],
        },
        updated_date: {
            label: 'Last updated',
            type: 'datetime',
            operators: ['between', 'greater', 'greater_or_equal', 'less', 'less_or_equal'],
        },
        id: {
            label: 'ID',
            type: 'number',
            operators: ['equal', 'between', 'greater', 'greater_or_equal', 'less', 'less_or_equal'],
            fieldSettings: { min: 0 },
            valueSources: ['value'],
        },
        project_id: {
            label: 'Project ID',
            type: 'number',
            operators: ['equal', 'between', 'greater', 'greater_or_equal', 'less', 'less_or_equal'],
            fieldSettings: { min: 0 },
            valueSources: ['value'],
        },
        name: {
            label: 'Name',
            type: 'text',
            valueSources: ['value'],
            operators: ['like'],
        },
        project_name: {
            label: 'Project name',
            type: 'text',
            valueSources: ['value'],
            operators: ['like'],
        },
    },
};

export const localStorageRecentCapacity = 10;
export const localStorageRecentKeyword = 'recentlyAppliedTasksFilters';
export const predefinedFilterValues = {
    '나에게 할당된': '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
    '내가 소유자인': '{"and":[{"==":[{"var":"owner"},"<username>"]}]}',
    '완료되지 않은': '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
};
