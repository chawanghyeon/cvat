import React, { useState, useEffect, useRef } from 'react';
import { SelectValue, RefSelectProps } from 'antd/lib/select';
import Autocomplete from 'antd/lib/auto-complete';
import Input from 'antd/lib/input';
import debounce from 'lodash/debounce';

import { getCore } from 'cvat-core-wrapper';
import { UserIcon, DownIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';

const core = getCore();

export interface User {
    id: number;
    username: string;
}

interface Props {
    value: User | null;
    username?: string;
    className?: string;
    onSelect: (user: User | null) => void;
    prefix?: boolean;
    suffix?: boolean;
}

const compareSortArray = (arr: any) => {
    const sortedResult = arr.sort((a, b) => {
        // 숫자가 포함된 부분까지만 비교
        const aNumber = parseInt(a.username.match(/\d+/)?.[0] || '0');
        const bNumber = parseInt(b.username.match(/\d+/)?.[0] || '0');
        // 숫자가 같으면 문자열을 비교, 아니면 숫자를 비교
        if (aNumber !== bNumber) {
            return aNumber - bNumber;
        } else {
            // 숫자가 같으면 문자열을 비교
            return a.username.localeCompare(b.username);
        }
    });
    return sortedResult;
};

const searchUsers = debounce(
    (searchValue: string, setUsers: (users: User[]) => void): void => {
        core.users
            .get({
                search: searchValue,
                limit: 10,
                is_active: true,
            })
            .then((result: User[]) => {
                if (result) {
                    // 사용자 객체의 username으로 정렬
                    const sortedResult = result.sort((a, b) => {
                        // 숫자가 포함된 부분까지만 비교
                        const aNumber = parseInt(a.username.match(/\d+/)?.[0] || '0');
                        const bNumber = parseInt(b.username.match(/\d+/)?.[0] || '0');
                        // 숫자가 같으면 문자열을 비교, 아니면 숫자를 비교
                        if (aNumber !== bNumber) {
                            return aNumber - bNumber;
                        } else {
                            // 숫자가 같으면 문자열을 비교
                            return a.username.localeCompare(b.username);
                        }
                    });
                    console.log('sortedResult ; ', sortedResult);
                    setUsers(compareSortArray(result));
                }
            });
    },
    250,
    {
        maxWait: 750,
    },
);

export default function UserSelector(props: Props): JSX.Element {
    const { t } = useTranslation();
    const { value, className, username, onSelect, prefix, suffix } = props;
    const [searchPhrase, setSearchPhrase] = useState(username || '');
    const [initialUsers, setInitialUsers] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const autocompleteRef = useRef<RefSelectProps | null>(null);

    useEffect(() => {
        core.users.get({ limit: 10, is_active: true }).then((result: User[]) => {
            if (result) {
                setInitialUsers(result);
            }
        });
    }, []);

    useEffect(() => {
        setUsers(compareSortArray(initialUsers));
    }, [initialUsers]);

    useEffect(() => {
        if (searchPhrase) {
            searchUsers(searchPhrase, setUsers);
        } else {
            setUsers(compareSortArray(initialUsers));
        }
    }, [searchPhrase]);

    const handleSearch = (searchValue: string): void => {
        setSearchPhrase(searchValue);
    };

    const onBlur = (): void => {
        if (!searchPhrase && value) {
            onSelect(null);
        } else if (searchPhrase) {
            const potentialUsers = users.filter((_user) => _user.username.includes(searchPhrase));
            if (potentialUsers.length === 1) {
                setSearchPhrase(potentialUsers[0].username);
                if (value?.id !== potentialUsers[0].id) {
                    onSelect(potentialUsers[0]);
                }
            } else {
                setSearchPhrase(value?.username || '');
            }
        }
    };

    const renderOption = (username: string | null | undefined) => (
        <Tooltip title={`${username}`} placement='right'>
            <span>{username}</span>
        </Tooltip>
    );
    const handleSelect = (_value: SelectValue): void => {
        const user = _value ? users.filter((_user) => _user.id === +_value)[0] : null;
        console.log('user : ', user);
        if ((user?.id || null) !== (value?.id || null)) {
            onSelect(user);
            if (user) {
                setSearchPhrase(user.username);
                onSelect(user);
            }
        }
    };

    useEffect(() => {
        if (value) {
            if (!users.filter((user) => user.id === value.id).length) {
                core.users.get({ id: value.id }).then((result: User[]) => {
                    const [user] = result;
                    if (user) {
                        setUsers(compareSortArray([...users, user]));
                    }
                });
            }

            setSearchPhrase(value.username);
        }
    }, [value]);

    const combinedClassName = className ? `${className} cvat-user-search-field` : 'cvat-user-search-field';
    return (
        <div className='cvat-user-search-assign' style={{ minWidth: 150 }}>
            <Autocomplete
                ref={autocompleteRef}
                value={searchPhrase}
                placeholder={t('search.selectAUser')}
                onSearch={handleSearch}
                onSelect={handleSelect}
                onBlur={onBlur}
                className={combinedClassName}
                options={users.map((user) => ({
                    value: user.id.toString(),
                    label: renderOption(user.username),
                }))}
            >
                <Input
                    style={{ minWidth: 150 }}
                    onPressEnter={() => autocompleteRef.current?.blur()}
                    prefix={prefix ? <UserIcon /> : null}
                    suffix={suffix ? <DownIcon /> : null}
                />
            </Autocomplete>
        </div>
    );
}
