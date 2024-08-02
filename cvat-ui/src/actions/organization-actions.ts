import { Store } from 'antd/lib/form/interface';
import { User } from 'components/task-page/user-selector';
import { getCore } from 'cvat-core-wrapper';
import { Cookies } from 'react-cookie';
import { ActionUnion, createAction, ThunkAction } from 'utils/redux';

const core = getCore();

export enum OrganizationActionsTypes {
    GET_ORGANIZATIONS = 'GET_ORGANIZATIONS',
    GET_ORGANIZATIONS_SUCCESS = 'GET_ORGANIZATIONS_SUCCESS',
    GET_ORGANIZATIONS_FAILED = 'GET_ORGANIZATIONS_FAILED',
    ACTIVATE_ORGANIZATION_SUCCESS = 'ACTIVATE_ORGANIZATION_SUCCESS',
    ACTIVATE_ORGANIZATION_FAILED = 'ACTIVATE_ORGANIZATION_FAILED',
    CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
    CREATE_ORGANIZATION_SUCCESS = 'CREATE_ORGANIZATION_SUCCESS',
    CREATE_ORGANIZATION_FAILED = 'CREATE_ORGANIZATION_FAILED',
    UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION',
    UPDATE_ORGANIZATION_SUCCESS = 'UPDATE_ORGANIZATION_SUCCESS',
    UPDATE_ORGANIZATION_FAILED = 'UPDATE_ORGANIZATION_FAILED',
    REMOVE_ORGANIZATION = 'REMOVE_ORGANIZATION',
    REMOVE_ORGANIZATION_SUCCESS = 'REMOVE_ORGANIZATION_SUCCESS',
    REMOVE_ORGANIZATION_FAILED = 'REMOVE_ORGANIZATION_FAILED',
    INVITE_ORGANIZATION_MEMBERS = 'INVITE_ORGANIZATION_MEMBERS',
    INVITE_ORGANIZATION_MEMBERS_FAILED = 'INVITE_ORGANIZATION_MEMBERS_FAILED',
    INVITE_ORGANIZATION_MEMBERS_DONE = 'INVITE_ORGANIZATION_MEMBERS_DONE',
    INVITE_ORGANIZATION_MEMBER_SUCCESS = 'INVITE_ORGANIZATION_MEMBER_SUCCESS',
    INVITE_ORGANIZATION_MEMBER_FAILED = 'INVITE_ORGANIZATION_MEMBER_FAILED',
    LEAVE_ORGANIZATION = 'LEAVE_ORGANIZATION',
    LEAVE_ORGANIZATION_SUCCESS = 'LEAVE_ORGANIZATION_SUCCESS',
    LEAVE_ORGANIZATION_FAILED = 'LEAVE_ORGANIZATION_FAILED',
    REMOVE_ORGANIZATION_MEMBER = 'REMOVE_ORGANIZATION_MEMBERS',
    REMOVE_ORGANIZATION_MEMBER_SUCCESS = 'REMOVE_ORGANIZATION_MEMBER_SUCCESS',
    REMOVE_ORGANIZATION_MEMBER_FAILED = 'REMOVE_ORGANIZATION_MEMBER_FAILED',
    UPDATE_ORGANIZATION_MEMBER = 'UPDATE_ORGANIZATION_MEMBER',
    UPDATE_ORGANIZATION_MEMBER_SUCCESS = 'UPDATE_ORGANIZATION_MEMBER_SUCCESS',
    UPDATE_ORGANIZATION_MEMBER_FAILED = 'UPDATE_ORGANIZATION_MEMBER_FAILED',
    GET_STATISTIC = 'GET_STATISTIC',
    GET_STATISTIC_SUCCESS = 'GET_STATISTIC_SUCCESS',
    GET_STATISTIC_FAILED = 'GET_STATISTIC_FAILED',
    GET_UMAP = 'GET_UMAP',
    GET_UMAP_SUCCESS = 'GET_UMAP_SUCCESS',
    GET_UMAP_FAILED = 'GET_UMAP_FAILED',
    GET_LABELS_SUCCESS = 'GET_LABELS_SUCCESS',
}

const organizationActions = {
    getOrganizations: () => createAction(OrganizationActionsTypes.GET_ORGANIZATIONS),
    getOrganizationsSuccess: (list: any[]) =>
        createAction(OrganizationActionsTypes.GET_ORGANIZATIONS_SUCCESS, { list }),
    getOrganizationsFailed: (error: any) => createAction(OrganizationActionsTypes.GET_ORGANIZATIONS_FAILED, { error }),
    createOrganization: () => createAction(OrganizationActionsTypes.CREATE_ORGANIZATION),
    createOrganizationSuccess: (organization: any) =>
        createAction(OrganizationActionsTypes.CREATE_ORGANIZATION_SUCCESS, { organization }),
    createOrganizationFailed: (slug: string, error: any) =>
        createAction(OrganizationActionsTypes.CREATE_ORGANIZATION_FAILED, { slug, error }),
    updateOrganization: () => createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION),
    updateOrganizationSuccess: (organization: any) =>
        createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION_SUCCESS, { organization }),
    updateOrganizationFailed: (slug: string, error: any) =>
        createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION_FAILED, { slug, error }),
    activateOrganizationSuccess: (organization: any | null) =>
        createAction(OrganizationActionsTypes.ACTIVATE_ORGANIZATION_SUCCESS, { organization }),
    activateOrganizationFailed: (error: any, slug: string | null) =>
        createAction(OrganizationActionsTypes.ACTIVATE_ORGANIZATION_FAILED, { slug, error }),
    removeOrganization: () => createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION),
    removeOrganizationSuccess: (slug: string) =>
        createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION_SUCCESS, { slug }),
    removeOrganizationFailed: (error: any, slug: string) =>
        createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION_FAILED, { error, slug }),
    inviteOrganizationMembers: () => createAction(OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBERS),
    inviteOrganizationMembersFailed: (error: any) =>
        createAction(OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBERS_FAILED, { error }),
    inviteOrganizationMembersDone: () => createAction(OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBERS_DONE),
    inviteOrganizationMemberSuccess: (email: string) =>
        createAction(OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBER_SUCCESS, { email }),
    inviteOrganizationMemberFailed: (email: string, error: any) =>
        createAction(OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBER_FAILED, { email, error }),
    leaveOrganization: () => createAction(OrganizationActionsTypes.LEAVE_ORGANIZATION),
    leaveOrganizationSuccess: () => createAction(OrganizationActionsTypes.LEAVE_ORGANIZATION_SUCCESS),
    leaveOrganizationFailed: (error: any) =>
        createAction(OrganizationActionsTypes.LEAVE_ORGANIZATION_FAILED, { error }),
    removeOrganizationMember: () => createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION_MEMBER),
    removeOrganizationMemberSuccess: () => createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION_MEMBER_SUCCESS),
    removeOrganizationMemberFailed: (username: string, error: any) =>
        createAction(OrganizationActionsTypes.REMOVE_ORGANIZATION_MEMBER_FAILED, { username, error }),
    updateOrganizationMember: () => createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION_MEMBER),
    updateOrganizationMemberSuccess: () => createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION_MEMBER_SUCCESS),
    updateOrganizationMemberFailed: (username: string, role: string, error: any) =>
        createAction(OrganizationActionsTypes.UPDATE_ORGANIZATION_MEMBER_FAILED, { username, role, error }),
    getStatistic: () => createAction(OrganizationActionsTypes.GET_STATISTIC),
    getStatisticSuccess: (statistic: any) =>
        createAction(OrganizationActionsTypes.GET_STATISTIC_SUCCESS, { statistic }),
    getStatisticFailed: (error: any) => createAction(OrganizationActionsTypes.GET_STATISTIC_FAILED, { error }),
    getUmap: () => createAction(OrganizationActionsTypes.GET_UMAP),
    getUmapSuccess: (umap: any) =>
        createAction(OrganizationActionsTypes.GET_UMAP_SUCCESS, { umap }),
    getUmapFailed: (error: any) => createAction(OrganizationActionsTypes.GET_UMAP_FAILED, { error }),
    getLabelsSuccess: (labels: any) =>
        createAction(OrganizationActionsTypes.GET_LABELS_SUCCESS, { labels }),
};

export function getOrganizationsAsync(): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.getOrganizations());

        try {
            const organizations = await core.organizations.get();
            let currentOrganization = null;

            try {
                // this action is dispatched after user is authentificated
                // need to configure organization at cvat-core immediately to get relevant data

                const cookie = new Cookies();
                if (cookie.get('organization')) {
                    console.log(`${cookie.get('organization')} exist`);
                    localStorage.setItem('currentOrganization', cookie.get('organization'));
                } else if (cookie.get('organization') === '') {
                    console.log('organization reset');
                    cookie.remove('organization');
                    localStorage.removeItem('currentOrganization');
                }

                const curSlug = localStorage.getItem('currentOrganization');
                if (curSlug) {
                    currentOrganization =
                        organizations.find((organization: any) => organization.slug === curSlug) || null;
                    if (currentOrganization) {
                        await core.organizations.activate(currentOrganization);
                    } else {
                        // not valid anymore (for example when organization
                        // does not exist anymore, or the user has been kicked from it)
                        localStorage.removeItem('currentOrganization');
                    }
                }

                dispatch(organizationActions.activateOrganizationSuccess(currentOrganization));
            } catch (error) {
                dispatch(
                    organizationActions.activateOrganizationFailed(error, localStorage.getItem('currentOrganization')),
                );
            } finally {
                dispatch(organizationActions.getOrganizationsSuccess(organizations));
            }
        } catch (error) {
            dispatch(organizationActions.getOrganizationsFailed(error));
        }
    };
}

export function createOrganizationAsync(
    organizationData: Store,
    onCreateSuccess?: (createdSlug: string) => void,
): ThunkAction {
    return async function (dispatch) {
        const { slug } = organizationData;
        const organization = new core.classes.Organization(organizationData);
        dispatch(organizationActions.createOrganization());

        try {
            const createdOrganization = await organization.save();
            dispatch(organizationActions.createOrganizationSuccess(createdOrganization));
            if (onCreateSuccess) onCreateSuccess(createdOrganization.slug);
        } catch (error) {
            dispatch(organizationActions.createOrganizationFailed(slug, error));
        }
    };
}

export function updateOrganizationAsync(organization: any): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.updateOrganization());

        try {
            const updatedOrganization = await organization.save();
            dispatch(organizationActions.updateOrganizationSuccess(updatedOrganization));
        } catch (error) {
            dispatch(organizationActions.updateOrganizationFailed(organization.slug, error));
        }
    };
}

export function removeOrganizationAsync(organization: any): ThunkAction {
    return async function (dispatch) {
        try {
            await organization.remove();
            localStorage.removeItem('currentOrganization');
            dispatch(organizationActions.removeOrganizationSuccess(organization.slug));
        } catch (error) {
            dispatch(organizationActions.removeOrganizationFailed(error, organization.slug));
        }
    };
}

export function inviteOrganizationMembersAsync(
    organization: any,
    members: { email: string; role: string }[],
    onFinish: () => void,
): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.inviteOrganizationMembers());
        try {
            for (let i = 0; i < members.length; i++) {
                const { email, role } = members[i];
                organization
                    .invite(email, role)
                    .then(() => {
                        dispatch(organizationActions.inviteOrganizationMemberSuccess(email));
                    })
                    .catch((error: any) => {
                        dispatch(organizationActions.inviteOrganizationMemberFailed(email, error));
                    })
                    .finally(() => {
                        if (i === members.length - 1) {
                            dispatch(organizationActions.inviteOrganizationMembersDone());
                            onFinish();
                        }
                    });
            }
        } catch (error) {
            dispatch(organizationActions.inviteOrganizationMembersFailed(error));
        }
    };
}

export function leaveOrganizationAsync(organization: any): ThunkAction {
    return async function (dispatch, getState) {
        const { user } = getState().auth;
        dispatch(organizationActions.leaveOrganization());
        try {
            await organization.leave(user);
            dispatch(organizationActions.leaveOrganizationSuccess());
            localStorage.removeItem('currentOrganization');
        } catch (error) {
            dispatch(organizationActions.leaveOrganizationFailed(error));
        }
    };
}

export function removeOrganizationMemberAsync(
    organization: any,
    { user, id }: { user: User; id: number },
    onFinish: () => void,
): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.removeOrganizationMember());
        try {
            await organization.deleteMembership(id);
            dispatch(organizationActions.removeOrganizationMemberSuccess());
            onFinish();
        } catch (error) {
            dispatch(organizationActions.removeOrganizationMemberFailed(user.username, error));
        }
    };
}

export function updateOrganizationMemberAsync(
    organization: any,
    { user, id }: { user: User; id: number },
    role: string,
    onFinish: () => void,
): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.updateOrganizationMember());
        try {
            await organization.updateMembership(id, role);
            dispatch(organizationActions.updateOrganizationMemberSuccess());
            onFinish();
        } catch (error) {
            dispatch(organizationActions.updateOrganizationMemberFailed(user.username, role, error));
        }
    };
}

export function getStatistic(userId: any): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.getStatistic());
        try {
            const statistic = await core.organizations.getStatistic(userId);
            dispatch(organizationActions.getStatisticSuccess(statistic));
        } catch (error) {
            dispatch(organizationActions.getStatisticFailed(error));
        }
    };
}

export function getUmap(labelId: any): ThunkAction {
    return async function (dispatch) {
        dispatch(organizationActions.getUmap());
        try {
            const umap = await core.organizations.getUmap(labelId);
            dispatch(organizationActions.getUmapSuccess(umap));
        } catch (error) {
            dispatch(organizationActions.getUmapFailed(error));
        }
    };
}

export function getLabels(org: string): ThunkAction {
    return async function (dispatch) {
        const labels = await core.labels.get({org: org});
        dispatch(organizationActions.getLabelsSuccess(labels));
    }
}


export type OrganizationActions = ActionUnion<typeof organizationActions>;
