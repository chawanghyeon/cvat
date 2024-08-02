import './styles.scss';
import React from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import Icon, {
    LoadingOutlined,
    CaretDownOutlined,
    UserOutlined,
    RightOutlined,
    MoneyCollectOutlined,
} from '@ant-design/icons';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Menu, { MenuProps } from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import Text from 'antd/lib/typography/Text';

import { getCore } from 'cvat-core-wrapper';

import {
    AdminIcon,
    CheckedIcon,
    EditIcon,
    InfoIcon,
    ListIcon,
    LogoutIcon,
    OrganizationIcon,
    SALMONLogo,
    SettingIcon,
} from 'icons';
import ChangePasswordDialog from 'components/change-password-modal/change-password-modal';
import { switchSettingsDialog as switchSettingsDialogAction } from 'actions/settings-actions';
import { logoutAsync, authActions } from 'actions/auth-actions';
import { CombinedState } from 'reducers';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from 'i18next';

import { Space } from 'antd';
import AnnotationTopBar from 'containers/header/annotation-top-bar';
import AnnotationActionBar from 'containers/header/annotation-action-bar';
import TopBarDrawer from './top-bar/top-bar-drawer';
import SettingsModal from './settings-modal/settings-modal';

const core = getCore();

interface Tool {
    name: string;
    description: string;
    server: {
        host: string;
        version: string;
    };
    core: {
        version: string;
    };
    canvas: {
        version: string;
    };
    ui: {
        version: string;
    };
}

interface StateToProps {
    jobInstance: any;
    canvasInstance: any;
    user: any;
    tool: Tool;
    switchSettingsShortcut: string;
    settingsDialogShown: boolean;
    changePasswordDialogShown: boolean;
    changePasswordFetching: boolean;
    logoutFetching: boolean;
    renderChangePasswordItem: boolean;
    isAnalyticsPluginActive: boolean;
    isModelsPluginActive: boolean;
    isGitPluginActive: boolean;
    organizationsFetching: boolean;
    organizationsList: any[];
    currentOrganization: any | null;
}

interface DispatchToProps {
    onLogout: () => void;
    switchSettingsDialog: (show: boolean) => void;
    switchChangePasswordDialog: (show: boolean) => void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            job: { instance: jobInstance },
            canvas: { instance: canvasInstance },
        },
        auth: {
            user,
            fetching: logoutFetching,
            fetching: changePasswordFetching,
            showChangePasswordDialog: changePasswordDialogShown,
            allowChangePassword: renderChangePasswordItem,
        },
        plugins: { list },
        about: { server, packageVersion },
        shortcuts: { normalizedKeyMap },
        settings: { showDialog: settingsDialogShown },
        organizations: { fetching: organizationsFetching, current: currentOrganization, list: organizationsList },
    } = state;

    return {
        jobInstance,
        canvasInstance,
        user,
        tool: {
            name: server.name as string,
            description: server.description as string,
            server: {
                host: core.config.backendAPI.slice(0, -7),
                version: server.version as string,
            },
            canvas: {
                version: packageVersion.canvas,
            },
            core: {
                version: packageVersion.core,
            },
            ui: {
                version: packageVersion.ui,
            },
        },
        switchSettingsShortcut: normalizedKeyMap.SWITCH_SETTINGS,
        settingsDialogShown,
        changePasswordDialogShown,
        changePasswordFetching,
        logoutFetching,
        renderChangePasswordItem,
        isAnalyticsPluginActive: list.ANALYTICS,
        isModelsPluginActive: list.MODELS,
        isGitPluginActive: list.GIT_INTEGRATION,
        organizationsFetching,
        currentOrganization,
        organizationsList,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onLogout: (): void => dispatch(logoutAsync()),
        switchSettingsDialog: (show: boolean): void => dispatch(switchSettingsDialogAction(show)),
        switchChangePasswordDialog: (show: boolean): void => dispatch(authActions.switchChangePasswordDialog(show)),
    };
}

type Props = StateToProps & DispatchToProps;

function HeaderContainer(props: Props): JSX.Element {
    const {
        jobInstance,
        canvasInstance,
        user,
        tool,
        logoutFetching,
        changePasswordFetching,
        settingsDialogShown,
        switchSettingsDialog,
        switchChangePasswordDialog,
        renderChangePasswordItem,
        isAnalyticsPluginActive,
        isModelsPluginActive,
        currentOrganization,
        organizationsList,
    } = props;
    const history = useHistory();
    const location = useLocation();

    const { t } = useTranslation();
    const resetOrganization = (): void => {
        localStorage.removeItem('currentOrganization');
        if (/(webhooks)|(\d+)/.test(window.location.pathname)) {
            window.location.pathname = '/';
        } else {
            window.location.reload();
        }
    };

    const setNewOrganization = (organization: any): void => {
        if (!currentOrganization || currentOrganization.slug !== organization.slug) {
            localStorage.setItem('currentOrganization', organization.slug);
            if (/\d+/.test(window.location.pathname)) {
                // a resource is opened (task/job/etc.)
                window.location.pathname = '/';
            } else {
                window.location.reload();
            }
        }
    };

    const userMenuItem: MenuProps['items'] = [
        {
            key: 'admin_page',
            label: t('header.menu.adminPage'),
            icon: <Icon component={AdminIcon} />,
            onClick: (): void => {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                window.open(`${tool.server.host}/admin`, '_blank');
            },
        },
        {
            key: 'change_password',
            label: t('header.menu.changePassword'),
            icon: changePasswordFetching ? <LoadingOutlined /> : <Icon component={EditIcon} />,
            onClick: (): void => switchChangePasswordDialog(true),
            disabled: changePasswordFetching,
            className: 'cvat-header-menu-change-password',
        },
        {
            key: 'billing',
            label: t('header.menu.billing'),
            icon: <MoneyCollectOutlined />,
            onClick: () => history.push('/billing'),
        },
        {
            key: 'logout',
            label: t('header.menu.logout'),
            icon: logoutFetching ? <LoadingOutlined /> : <Icon component={LogoutIcon} />,
            onClick: () => history.push('/auth/logout'),
            disabled: logoutFetching,
        },
    ];

    const userMenu = (
        <Menu
            className='cvat-header-menu'
            items={userMenuItem
                .filter((menu) => (user.isStaff ? menu : menu?.key !== 'admin_page'))
                .filter((menu) => (renderChangePasswordItem ? menu : menu?.key !== 'change_password'))}
        />
    );

    const organizationMenuItem: MenuProps['items'] = [
        {
            key: '$personal',
            label: t('header.menu.personalWorkspace'),
            icon: !currentOrganization ? <Icon component={CheckedIcon} /> : null,
            onClick: resetOrganization,
        },
        ...organizationsList.map((organization) => ({
            key: organization.slug,
            label: organization.slug,
            icon: currentOrganization?.slug === organization.slug ? <Icon component={CheckedIcon} /> : null,
            onClick: () => setNewOrganization(organization),
        })),
    ];

    const organizationMenu = <Menu className='cvat-header-menu' items={organizationMenuItem} />;
    const i18nMenuItem: MenuProps['items'] = [
        {
            key: '$ko',
            label: 'Korea',
            icon: !currentOrganization ? <Icon component={CheckedIcon} /> : null,
            onClick: () => changeLanguage('ko'),
        },
        {
            key: '$en',
            label: 'English',
            icon: !currentOrganization ? <Icon component={CheckedIcon} /> : null,
            onClick: () => changeLanguage('en'),
        },
    ];
    const i18nMenu = <Menu className='cvat-header-menu' items={i18nMenuItem} />;

    const getButtonClassName = (value: string): string => {
        // eslint-disable-next-line security/detect-non-literal-regexp
        const regex = new RegExp(`${value}$`);
        return location.pathname.match(regex) ? 'cvat-header-button cvat-active-header-button' : 'cvat-header-button';
    };

    const getJobMenu = (): JSX.Element => (
        <>
            <div className='cvat-left-header'>
                <Icon
                    className='cvat-logo-icon'
                    component={SALMONLogo}
                    onClick={() => {
                        window.location.href = '/tasks';
                    }}
                />
                <Space
                    className='task-title'
                    onClick={() => {
                        if (user.isStaff || user.isSuperuser) history.push(`/tasks/${jobInstance.taskId}`);
                        else history.push('/jobs');
                    }}
                >
                    <Icon component={ListIcon} />
                    <span>Tasks</span>
                    <RightOutlined />
                    <span>{jobInstance.taskName}</span>
                </Space>
            </div>
            <div className='cvat-middle-header'>
                <AnnotationTopBar />
            </div>
            <div className='cvat-right-header'>
                <AnnotationActionBar />
                <Text style={{ marginLeft: 2.5 }}>{user.username}</Text>
                <TopBarDrawer />
                <Button
                    type='text'
                    onClick={() => switchSettingsDialog(true)}
                    icon={<Icon component={SettingIcon} />}
                />
                <Dropdown placement='bottom' dropdownRender={() => userMenu} className='cvat-header-menu-user-dropdown'>
                    <Button type='text' icon={<UserOutlined />} />
                </Dropdown>
                <Dropdown placement='bottom' dropdownRender={() => i18nMenu} className='cvat-header-menu-i18n-dropdown'>
                    <span
                        style={{
                            color: '#acacb5',
                            cursor: 'pointer',
                        }}
                    >
                        {t('header.language')}
                    </span>
                </Dropdown>
                <Dropdown
                    placement='bottom'
                    dropdownRender={() => organizationMenu}
                    className='cvat-header-menu-org-dropdown'
                >
                    <span>
                        <Icon component={OrganizationIcon} className='org-icon' />
                        {currentOrganization ? (
                            <Text className='cvat-header-menu-user-dropdown-organization'>
                                {currentOrganization.slug}
                            </Text>
                        ) : (
                            <Text>{t('header.menu.personalWorkspace')}</Text>
                        )}
                        <CaretDownOutlined className='cvat-header-dropdown-icon' />
                    </span>
                </Dropdown>
            </div>
            <SettingsModal visible={settingsDialogShown} onClose={() => switchSettingsDialog(false)} />
            {renderChangePasswordItem && <ChangePasswordDialog onClose={() => switchChangePasswordDialog(false)} />}
        </>
    );

    return (
        <Layout.Header className='cvat-header'>
            {jobInstance && canvasInstance ? (
                getJobMenu()
            ) : (
                <>
                    <div className='cvat-left-header'>
                        <Icon
                            className='cvat-logo-icon'
                            component={SALMONLogo}
                            onClick={() => {
                                history.push('/tasks');
                            }}
                        />
                        <Button
                            className={getButtonClassName('projects')}
                            type='link'
                            value='projects'
                            href='/projects?page=1'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/projects');
                            }}
                        >
                            {t('header.projects')}
                        </Button>
                        <Button
                            className={getButtonClassName('tasks')}
                            type='link'
                            value='tasks'
                            href='/tasks?page=1'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/tasks');
                            }}
                        >
                            {t('header.tasks')}
                        </Button>
                        <Button
                            className={getButtonClassName('jobs')}
                            type='link'
                            value='jobs'
                            href='/jobs?page=1'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/jobs');
                            }}
                        >
                            {t('header.jobs')}
                        </Button>
                        <Button
                            className={getButtonClassName('organizations')}
                            type='link'
                            value='organizations'
                            href='/organizations?page=1'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/organizations');
                            }}
                        >
                            {t('header.organizations')}
                        </Button>
                        {/* <Button
                                className={getButtonClassName('cloudstorages')}
                                type='link'
                                value='cloudstorages'
                                href='/cloudstorages?page=1'
                                onClick={(event: React.MouseEvent): void => {
                                    event.preventDefault();
                                    history.push('/cloudstorages');
                                }}
                            >
                                Cloud storages
                            </Button> */}
                        {/* models page잠시 비활성화 */}
                        {/* {isModelsPluginActive ? (
                            <Button
                                className={getButtonClassName('models')}
                                type='link'
                                value='models'
                                href='/models'
                                onClick={(event: React.MouseEvent): void => {
                                    event.preventDefault();
                                    history.push('/models');
                                }}
                            >
                                Models
                            </Button>
                        ) : null} */}
                        {isAnalyticsPluginActive ? (
                            <Button
                                className='cvat-header-button'
                                type='link'
                                href={`${tool.server.host}/analytics`}
                                onClick={(event: React.MouseEvent): void => {
                                    event.preventDefault();
                                    // false positive
                                    // eslint-disable-next-line
                                    window.open(`${tool.server.host}/analytics`, '_blank');
                                }}
                            >
                                Analytics
                            </Button>
                        ) : null}
                        <Button
                            className={getButtonClassName('statistics')}
                            type='link'
                            value='statistics'
                            href='/statistics'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/statistics');
                            }}
                        >
                            {t('header.statistics')}
                        </Button>
                        {/* <Button
                            className={getButtonClassName('umap')}
                            type='link'
                            value='umap'
                            href='/umap'
                            onClick={(event: React.MouseEvent): void => {
                                event.preventDefault();
                                history.push('/umap');
                            }}
                        >
                            {t('header.umap')}
                        </Button> */}
                    </div>
                    <div className='cvat-right-header'>
                        <Text>{user.username}</Text>
                        <Button type='text' icon={<Icon component={InfoIcon} />} />
                        <Button
                            type='text'
                            onClick={() => switchSettingsDialog(true)}
                            icon={<Icon component={SettingIcon} />}
                        />
                        <Dropdown
                            placement='bottom'
                            dropdownRender={() => userMenu}
                            className='cvat-header-menu-user-dropdown'
                        >
                            <Button type='text' icon={<UserOutlined />} />
                        </Dropdown>

                        <Dropdown
                            placement='bottom'
                            dropdownRender={() => i18nMenu}
                            className='cvat-header-menu-i18n-dropdown'
                        >
                            <span
                                style={{
                                    color: '#acacb5',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('header.language')}
                            </span>
                        </Dropdown>
                        <Dropdown
                            placement='bottom'
                            dropdownRender={() => organizationMenu}
                            className='cvat-header-menu-org-dropdown'
                        >
                            <span>
                                <Icon component={OrganizationIcon} className='org-icon' />
                                {currentOrganization ? (
                                    <Text className='cvat-header-menu-user-dropdown-organization'>
                                        {currentOrganization.slug}
                                    </Text>
                                ) : (
                                    <Text>Personal workspace</Text>
                                )}
                                <CaretDownOutlined className='cvat-header-dropdown-icon' />
                            </span>
                        </Dropdown>
                    </div>
                    <SettingsModal visible={settingsDialogShown} onClose={() => switchSettingsDialog(false)} />
                    {renderChangePasswordItem && (
                        <ChangePasswordDialog onClose={() => switchChangePasswordDialog(false)} />
                    )}
                </>
            )}
        </Layout.Header>
    );
}

function propsAreTheSame(prevProps: Props, nextProps: Props): boolean {
    let equal = true;
    for (const prop in nextProps) {
        if (prop in prevProps && (prevProps as any)[prop] !== (nextProps as any)[prop]) {
            if (prop !== 'tool') {
                equal = false;
            }
        }
    }

    return equal;
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(HeaderContainer, propsAreTheSame));
