import { Config } from 'react-awesome-query-builder';

export const config: Partial<Config> = {
    fields: {
        id: {
            label: 'ID',
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
    },
};

export const localStorageRecentCapacity = 10;
export const localStorageRecentKeyword = 'recentlyAppliedProjectsFilters';
export const predefinedFilterValues = {
    '나에게 할당된': '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
    '내가 소유자인': '{"and":[{"==":[{"var":"owner"},"<username>"]}]}',
    '완료되지 않은': '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
};
