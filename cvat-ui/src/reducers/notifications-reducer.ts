/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable operator-linebreak */
import { AnyAction } from 'redux';

import { AuthActionTypes } from 'actions/auth-actions';
import { FormatsActionTypes } from 'actions/formats-actions';
import { ModelsActionTypes } from 'actions/models-actions';
import { ShareActionTypes } from 'actions/share-actions';
import { TasksActionTypes } from 'actions/tasks-actions';
import { ProjectsActionTypes } from 'actions/projects-actions';
import { AboutActionTypes } from 'actions/about-actions';
import { AnnotationActionTypes } from 'actions/annotation-actions';
import { NotificationsActionType } from 'actions/notification-actions';
import { BoundariesActionTypes } from 'actions/boundaries-actions';
import { UserAgreementsActionTypes } from 'actions/useragreements-actions';
import { ReviewActionTypes } from 'actions/review-actions';
import { ExportActionTypes } from 'actions/export-actions';
import { ImportActionTypes } from 'actions/import-actions';
import { CloudStorageActionTypes } from 'actions/cloud-storage-actions';
import { OrganizationActionsTypes } from 'actions/organization-actions';
import { JobsActionTypes } from 'actions/jobs-actions';
import { WebhooksActionsTypes } from 'actions/webhooks-actions';

import i18n from 'i18n/i18n';
import { NotificationsState } from '.';

const defaultState: NotificationsState = {
    errors: {
        auth: {
            authorized: null,
            login: null,
            logout: null,
            register: null,
            changePassword: null,
            requestPasswordReset: null,
            resetPassword: null,
            loadAuthActions: null,
        },
        projects: {
            fetching: null,
            updating: null,
            deleting: null,
            creating: null,
            restoring: null,
            backuping: null,
        },
        tasks: {
            fetching: null,
            updating: null,
            dumping: null,
            loading: null,
            exportingAsDataset: null,
            deleting: null,
            creating: null,
            exporting: null,
            importing: null,
            moving: null,
        },
        jobs: {
            updating: null,
            fetching: null,
        },
        formats: {
            fetching: null,
        },
        users: {
            fetching: null,
        },
        about: {
            fetching: null,
        },
        share: {
            fetching: null,
        },
        models: {
            starting: null,
            fetching: null,
            canceling: null,
            metaFetching: null,
            inferenceStatusFetching: null,
            creating: null,
            deleting: null,
        },
        annotation: {
            saving: null,
            jobFetching: null,
            frameFetching: null,
            changingLabelColor: null,
            updating: null,
            creating: null,
            merging: null,
            grouping: null,
            splitting: null,
            removing: null,
            propagating: null,
            collectingStatistics: null,
            savingJob: null,
            uploadAnnotations: null,
            removeAnnotations: null,
            fetchingAnnotations: null,
            undo: null,
            redo: null,
            search: null,
            searchEmptyFrame: null,
            deleteFrame: null,
            restoreFrame: null,
            savingLogs: null,
        },
        boundaries: {
            resetError: null,
        },
        userAgreements: {
            fetching: null,
        },
        review: {
            commentingIssue: null,
            finishingIssue: null,
            reopeningIssue: null,
            resolvingIssue: null,
            submittingReview: null,
            deletingIssue: null,
        },
        exporting: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        importing: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        cloudStorages: {
            creating: null,
            fetching: null,
            updating: null,
            deleting: null,
        },
        organizations: {
            fetching: null,
            creating: null,
            updating: null,
            activation: null,
            deleting: null,
            leaving: null,
            inviting: null,
            updatingMembership: null,
            removingMembership: null,
        },
        webhooks: {
            fetching: null,
            creating: null,
            updating: null,
            deleting: null,
        },
    },
    messages: {
        tasks: {
            loadingDone: '',
            importingDone: '',
            movingDone: '',
        },
        models: {
            inferenceDone: '',
        },
        auth: {
            changePasswordDone: '',
            registerDone: '',
            requestPasswordResetDone: '',
            resetPasswordDone: '',
        },
        projects: {
            restoringDone: '',
        },
        exporting: {
            dataset: '',
            annotation: '',
            backup: '',
        },
        importing: {
            dataset: '',
            annotation: '',
            backup: '',
        },
    },
};

export default function (state = defaultState, action: AnyAction): NotificationsState {
    switch (action.type) {
        case AuthActionTypes.AUTHORIZED_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        authorized: {
                            message: i18n.t('notifications.auth.AUTHORIZED_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.LOGIN_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        login: {
                            message: i18n.t('notifications.auth.LOGIN_FAILED'),
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-login-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.LOGOUT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        logout: {
                            message: i18n.t('notifications.auth.LOGOUT_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REGISTER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        register: {
                            message: i18n.t('notifications.auth.REGISTER_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REGISTER_SUCCESS: {
            if (!action.payload.user.isVerified) {
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        auth: {
                            ...state.messages.auth,
                            registerDone: `${i18n.t('notifications.auth.REGISTER_SUCCESS_1')} \
                                 ${i18n.t('notifications.auth.REGISTER_SUCCESS_2')} ${action.payload.user.email}.`,
                        },
                    },
                };
            }

            return {
                ...state,
            };
        }
        case AuthActionTypes.CHANGE_PASSWORD_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        changePasswordDone: i18n.t('notifications.auth.CHANGE_PASSWORD_SUCCESS'),
                    },
                },
            };
        }
        case AuthActionTypes.CHANGE_PASSWORD_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        changePassword: {
                            message: i18n.t('notifications.auth.CHANGE_PASSWORD_FAILED'),
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-change-password-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REQUEST_PASSWORD_RESET_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        requestPasswordResetDone: i18n.t('notifications.auth.REQUEST_PASSWORD_RESET_SUCCESS'),
                    },
                },
            };
        }
        case AuthActionTypes.REQUEST_PASSWORD_RESET_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        requestPasswordReset: {
                            message: i18n.t('notifications.auth.REQUEST_PASSWORD_RESET_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.RESET_PASSWORD_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        resetPasswordDone: i18n.t('notifications.auth.RESET_PASSWORD_SUCCESS'),
                    },
                },
            };
        }
        case AuthActionTypes.RESET_PASSWORD_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        resetPassword: {
                            message: i18n.t('notifications.auth.RESET_PASSWORD_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.LOAD_AUTH_ACTIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        loadAuthActions: {
                            message: i18n.t('notifications.auth.LOAD_AUTH_ACTIONS_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_DATASET_FAILED: {
            const { instance, instanceType } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    exporting: {
                        ...state.errors.exporting,
                        dataset: {
                            message:
                                `${i18n.t('notifications.exporting.EXPORT_DATASET_FAILED')}` +
                                `[${instanceType} ${instance.id}](/${instanceType}s/${instance.id})`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_DATASET_SUCCESS: {
            const { instance, instanceType, isLocal, resource } = action.payload;
            const auxiliaryVerb = resource === 'Dataset' ? 'has' : 'have';
            return {
                ...state,
                messages: {
                    ...state.messages,
                    exporting: {
                        ...state.messages.exporting,
                        dataset:
                            `${resource} ${i18n.t(
                                'notifications.exporting.EXPORT_DATASET_SUCCESS_1',
                            )} ${instanceType} ${instance.id} ` +
                            `${auxiliaryVerb} ${i18n.t('notifications.exporting.EXPORT_DATASET_SUCCESS_2')} ${
                                isLocal
                                    ? `${i18n.t('notifications.exporting.EXPORT_DATASET_SUCCESS_3')}`
                                    : `${i18n.t('notifications.exporting.EXPORT_DATASET_SUCCESS_4')}`
                            } ` +
                            `${
                                isLocal
                                    ? `${i18n.t('notifications.exporting.EXPORT_DATASET_SUCCESS_5')}`
                                    : `${i18n.t('notifications.exporting.EXPORT_DATASET_SUCCESS_6')}`
                            }`,
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_BACKUP_FAILED: {
            const { instance, instanceType } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    exporting: {
                        ...state.errors.exporting,
                        backup: {
                            message: `${i18n.t('notifications.exporting.EXPORT_BACKUP_FAILED')} ${instanceType} №${
                                instance.id
                            }`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_BACKUP_SUCCESS: {
            const { instance, instanceType, isLocal } = action.payload;
            return {
                ...state,
                messages: {
                    ...state.messages,
                    exporting: {
                        ...state.messages.exporting,
                        backup:
                            `${i18n.t('notifications.exporting.EXPORT_BACKUP_SUCCESS_1')} ${instanceType} №${
                                instance.id
                            } ` +
                            `${i18n.t('notifications.exporting.EXPORT_BACKUP_SUCCESS_2')} ${
                                isLocal ? `${i18n.t('notifications.exporting.EXPORT_BACKUP_SUCCESS_3')}` : 'uploaded'
                            } ` +
                            `${
                                isLocal
                                    ? `${i18n.t('notifications.exporting.EXPORT_BACKUP_SUCCESS_4')}`
                                    : `${i18n.t('notifications.exporting.EXPORT_BACKUP_SUCCESS_5')}`
                            }`,
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_DATASET_SUCCESS: {
            const { instance, resource } = action.payload;
            const message =
                resource === 'annotation'
                    ? `${i18n.t('notifications.importing.IMPORT_DATASET_SUCCESS_1')}` +
                      `[${i18n.t('notifications.importing.IMPORT_DATASET_SUCCESS_2')} ${
                          instance.taskId || instance.id
                      }](/tasks/${instance.taskId || instance.id}) `
                    : `${i18n.t('notifications.importing.IMPORT_DATASET_SUCCESS_3')} ${instance.id}](/projects/${
                          instance.id
                      })`;
            return {
                ...state,
                messages: {
                    ...state.messages,
                    importing: {
                        ...state.messages.importing,
                        [resource]: message,
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_DATASET_FAILED: {
            const { instance, resource } = action.payload;
            const message =
                resource === 'annotation'
                    ? `${i18n.t('notifications.importing.IMPORT_DATASET_FAILED_1')}` +
                      `[${i18n.t('notifications.importing.IMPORT_DATASET_FAILED_2')} ${
                          instance.taskId || instance.id
                      }](/tasks/${instance.taskId || instance.id})`
                    : `${i18n.t('notifications.importing.IMPORT_DATASET_FAILED_3')} ${instance.id}](/projects/${
                          instance.id
                      })`;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    importing: {
                        ...state.errors.importing,
                        dataset: {
                            message,
                            reason: action.payload.error.toString(),
                            className:
                                'cvat-notification-notice-' +
                                `${resource === 'annotation' ? 'load-annotation' : 'import-dataset'}-failed`,
                        },
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_BACKUP_SUCCESS: {
            const { instanceId, instanceType } = action.payload;
            return {
                ...state,
                messages: {
                    ...state.messages,
                    importing: {
                        ...state.messages.importing,
                        backup: `${i18n.t('notifications.importing.IMPORT_BACKUP_SUCCESS_1')} ${instanceType} ${i18n.t(
                            'notifications.importing.IMPORT_BACKUP_SUCCESS_2',
                        )}
                            ${i18n.t(
                                'notifications.importing.IMPORT_BACKUP_SUCCESS_3',
                            )}(/${instanceType}s/${instanceId}) ${i18n.t(
                            'notifications.importing.IMPORT_BACKUP_SUCCESS_4',
                        )}`,
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_BACKUP_FAILED: {
            const { instanceType } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    importing: {
                        ...state.errors.importing,
                        backup: {
                            message: `${i18n.t(
                                'notifications.importing.IMPORT_BACKUP_FAILED_1',
                            )} ${instanceType} ${i18n.t('notifications.importing.IMPORT_BACKUP_FAILED_2')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case TasksActionTypes.GET_TASKS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        fetching: {
                            message: `${i18n.t('notifications.tasks.GET_TASKS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case TasksActionTypes.DELETE_TASK_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        deleting: {
                            message: `${i18n.t('notifications.tasks.DELETE_TASK_FAILED')} ${taskID}](/tasks/${taskID})`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-delete-task-failed',
                        },
                    },
                },
            };
        }
        case TasksActionTypes.CREATE_TASK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        creating: {
                            message: `${i18n.t('notifications.tasks.CREATE_TASK_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-create-task-failed',
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.GET_PROJECTS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        fetching: {
                            message: `${i18n.t('notifications.projects.GET_PROJECTS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.CREATE_PROJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        creating: {
                            message: `${i18n.t('notifications.projects.CREATE_PROJECT_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-create-project-failed',
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.DELETE_PROJECT_FAILED: {
            const { projectId } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        updating: {
                            message: `${i18n.t(
                                'notifications.projects.DELETE_PROJECT_FAILED',
                            )} ${projectId}](/project/${projectId})`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-delete-project-failed',
                        },
                    },
                },
            };
        }
        case FormatsActionTypes.GET_FORMATS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    formats: {
                        ...state.errors.formats,
                        fetching: {
                            message: `${i18n.t('notifications.formats.GET_FORMATS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AboutActionTypes.GET_ABOUT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    about: {
                        ...state.errors.about,
                        fetching: {
                            message: `${i18n.t('notifications.about.GET_ABOUT_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ShareActionTypes.LOAD_SHARE_DATA_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    share: {
                        ...state.errors.share,
                        fetching: {
                            message: `${i18n.t('notifications.share.LOAD_SHARE_DATA_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_INFERENCE_STATUS_SUCCESS: {
            if (action.payload.activeInference.status === 'finished') {
                const { taskID } = action.payload;
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        models: {
                            ...state.messages.models,
                            inferenceDone: `${i18n.t(
                                'notifications.models.GET_INFERENCE_STATUS_SUCCESS',
                            )} ${taskID}](/tasks/${taskID})`,
                        },
                    },
                };
            }

            return {
                ...state,
            };
        }
        case ModelsActionTypes.FETCH_META_FAILED: {
            if (action.payload.error.code === 403) {
                return state;
            }

            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        metaFetching: {
                            message: `${i18n.t('notifications.models.GET_INFERENCE_STATUS_SUCCESS')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_INFERENCE_STATUS_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        inferenceStatusFetching: {
                            message: `${i18n.t(
                                'notifications.models.GET_INFERENCE_STATUS_FAILED',
                            )} ${taskID}](/tasks/${taskID})`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_MODELS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        fetching: {
                            message: i18n.t('notifications.models.GET_MODELS_FAILED'),
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.START_INFERENCE_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        starting: {
                            message: `${i18n.t(
                                'notifications.models.START_INFERENCE_FAILED',
                            )} ${taskID}](/tasks/${taskID})`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.CANCEL_INFERENCE_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        canceling: {
                            message: `${i18n.t(
                                'notifications.models.CANCEL_INFERENCE_FAILED',
                            )} ${taskID}](/tasks/${taskID})`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.GET_JOB_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        jobFetching: {
                            message: `${i18n.t('notifications.annotation.GET_JOB_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-fetch-job-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.CHANGE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        frameFetching: {
                            message: `${i18n.t('notifications.annotation.CHANGE_FRAME_FAILED')} ${
                                action.payload.number
                            }`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SAVE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        saving: {
                            message: `${i18n.t('notifications.annotation.SAVE_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-save-annotations-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UPDATE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        updating: {
                            message: `${i18n.t('notifications.annotation.UPDATE_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-annotations-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.CREATE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        creating: {
                            message: `${i18n.t('notifications.annotation.CREATE_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.MERGE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        merging: {
                            message: `${i18n.t('notifications.annotation.MERGE_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.GROUP_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        grouping: {
                            message: `${i18n.t('notifications.annotation.GROUP_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SPLIT_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        splitting: {
                            message: `${i18n.t('notifications.annotation.SPLIT_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REMOVE_OBJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        removing: {
                            message: `${i18n.t('notifications.annotation.REMOVE_OBJECT_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-remove-object-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.PROPAGATE_OBJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        propagating: {
                            message: `${i18n.t('notifications.annotation.PROPAGATE_OBJECT_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.COLLECT_STATISTICS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        collectingStatistics: {
                            message: `${i18n.t('notifications.annotation.COLLECT_STATISTICS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UPLOAD_JOB_ANNOTATIONS_FAILED: {
            const { job, error } = action.payload;

            const { id: jobID, taskId: taskID } = job;

            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        uploadAnnotations: {
                            message: `${i18n.t(
                                'notifications.annotation.UPLOAD_JOB_ANNOTATIONS_FAILED',
                            )} ${jobID}](/tasks/${taskID}/jobs/${jobID})`,
                            reason: error.toString(),
                            className: 'cvat-notification-notice-upload-annotations-fail',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REMOVE_JOB_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        removeAnnotations: {
                            message: `${i18n.t('notifications.annotation.REMOVE_JOB_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.FETCH_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        fetchingAnnotations: {
                            message: `${i18n.t('notifications.annotation.FETCH_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REDO_ACTION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        redo: {
                            message: `${i18n.t('notifications.annotation.REDO_ACTION_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UNDO_ACTION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        undo: {
                            message: `${i18n.t('notifications.annotation.UNDO_ACTION_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SEARCH_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        search: {
                            message: `${i18n.t('notifications.annotation.SEARCH_ANNOTATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SEARCH_EMPTY_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        searchEmptyFrame: {
                            message: `${i18n.t('notifications.annotation.SEARCH_EMPTY_FRAME_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SAVE_LOGS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        savingLogs: {
                            message: `${i18n.t('notifications.annotation.SAVE_LOGS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case BoundariesActionTypes.THROW_RESET_ERROR: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    boundaries: {
                        ...state.errors.annotation,
                        resetError: {
                            message: `${i18n.t('notifications.boundaries.THROW_RESET_ERROR')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case UserAgreementsActionTypes.GET_USER_AGREEMENTS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    userAgreements: {
                        ...state.errors.userAgreements,
                        fetching: {
                            message: `${i18n.t('notifications.userAgreements.GET_USER_AGREEMENTS_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.FINISH_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        finishingIssue: {
                            message: `${i18n.t('notifications.review.FINISH_ISSUE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.RESOLVE_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        resolvingIssue: {
                            message: `${i18n.t('notifications.review.RESOLVE_ISSUE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.REOPEN_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        reopeningIssue: {
                            message: `${i18n.t('notifications.review.REOPEN_ISSUE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.COMMENT_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        commentingIssue: {
                            message: `${i18n.t('notifications.review.COMMENT_ISSUE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.SUBMIT_REVIEW_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        submittingReview: {
                            message: `${i18n.t('notifications.review.SUBMIT_REVIEW_FAILED')} ${action.payload.jobId}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.REMOVE_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        deletingIssue: {
                            message: `${i18n.t('notifications.review.REMOVE_ISSUE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case NotificationsActionType.RESET_ERRORS: {
            return {
                ...state,
                errors: {
                    ...defaultState.errors,
                },
            };
        }
        case NotificationsActionType.RESET_MESSAGES: {
            return {
                ...state,
                messages: {
                    ...defaultState.messages,
                },
            };
        }
        case AnnotationActionTypes.GET_DATA_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        jobFetching: {
                            message: `${i18n.t('notifications.annotation.GET_DATA_FAILED')}`,
                            reason: action.payload.error,
                            className: 'cvat-notification-notice-fetch-frame-data-from-the-server-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.DELETE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        deleteFrame: {
                            message: `${i18n.t('notifications.annotation.DELETE_FRAME_FAILED')}`,
                            reason: action.payload.error,
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.RESTORE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        restoreFrame: {
                            message: `${i18n.t('notifications.annotation.RESTORE_FRAME_FAILED')}`,
                            reason: action.payload.error,
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: `${i18n.t('notifications.cloudStorages.GET_CLOUD_STORAGE_FAILED')}`,
                            reason: action.payload.error.toString(),
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.CREATE_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        creating: {
                            message: `${i18n.t('notifications.cloudStorages.CREATE_CLOUD_STORAGE_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-create-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGE_FAILED: {
            const { cloudStorage, error } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        updating: {
                            message: `${i18n.t('notifications.cloudStorages.UPDATE_CLOUD_STORAGE_FAILED')} #${
                                cloudStorage.id
                            }`,
                            reason: error.toString(),
                            className: 'cvat-notification-notice-update-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.DELETE_CLOUD_STORAGE_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        deleting: {
                            message: `${i18n.t(
                                'notifications.cloudStorages.DELETE_CLOUD_STORAGE_FAILED',
                            )} ${cloudStorageID}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-delete-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.LOAD_CLOUD_STORAGE_CONTENT_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: `${i18n.t(
                                'notifications.cloudStorages.LOAD_CLOUD_STORAGE_CONTENT_FAILED',
                            )} #${cloudStorageID}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-fetch-cloud-storage-content-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_STATUS_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: `${i18n.t(
                                'notifications.cloudStorages.GET_CLOUD_STORAGE_STATUS_FAILED_1',
                            )} #${cloudStorageID} ${i18n.t(
                                'notifications.cloudStorages.GET_CLOUD_STORAGE_STATUS_FAILED_2',
                            )}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-fetch-cloud-storage-status-failed',
                        },
                    },
                },
            };
        }

        case CloudStorageActionTypes.GET_CLOUD_STORAGE_PREVIEW_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: `${i18n.t(
                                'notifications.cloudStorages.GET_CLOUD_STORAGE_PREVIEW_FAILED',
                            )} #${cloudStorageID}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-fetch-cloud-storage-preview-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.GET_ORGANIZATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        fetching: {
                            message: `${i18n.t('notifications.organizations.GET_ORGANIZATIONS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-fetch-organizations-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.CREATE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        creating: {
                            message: `${i18n.t('notifications.organizations.CREATE_ORGANIZATION_FAILED')} ${
                                action.payload.slug
                            }`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-create-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.UPDATE_ORGANIZATION_FAILED: {
            const { slug } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        updating: {
                            message: `${i18n.t('notifications.organizations.UPDATE_ORGANIZATION_FAILED')} "${slug}"`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.ACTIVATE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        activation: {
                            message: `${i18n.t('notifications.organizations.ACTIVATE_ORGANIZATION_FAILED')} ${
                                action.payload.slug || ''
                            }`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-activate-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.REMOVE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        deleting: {
                            message: `${i18n.t('notifications.organizations.REMOVE_ORGANIZATION_FAILED')} ${
                                action.payload.slug
                            }`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-remove-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBERS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        inviting: {
                            message: `${i18n.t('notifications.organizations.INVITE_ORGANIZATION_MEMBERS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-invite-organization-members-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        inviting: {
                            message: `${i18n.t('notifications.organizations.INVITE_ORGANIZATION_MEMBER_FAILED_1')} "${
                                action.payload.email
                            }" ${i18n.t('notifications.organizations.INVITE_ORGANIZATION_MEMBER_FAILED_2')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-invite-organization-member-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.LEAVE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        leaving: {
                            message: `${i18n.t('notifications.organizations.LEAVE_ORGANIZATION_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-leave-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.REMOVE_ORGANIZATION_MEMBER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        removingMembership: {
                            message: `${i18n.t('notifications.organizations.REMOVE_ORGANIZATION_MEMBER_FAILED_1')} "${
                                action.payload.username
                            }" ${i18n.t('notifications.organizations.REMOVE_ORGANIZATION_MEMBER_FAILED_2')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-remove-organization-member-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.UPDATE_ORGANIZATION_MEMBER_FAILED: {
            const { role, username } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        updatingMembership: {
                            message: `${i18n.t(
                                'notifications.organizations.UPDATE_ORGANIZATION_MEMBER_FAILED_1',
                            )} "${role}" ${i18n.t(
                                'notifications.organizations.UPDATE_ORGANIZATION_MEMBER_FAILED_2',
                            )} "${username}"`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-organization-membership-failed',
                        },
                    },
                },
            };
        }
        case JobsActionTypes.GET_JOBS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    jobs: {
                        ...state.errors.jobs,
                        fetching: {
                            message: `${i18n.t('notifications.jobs.GET_JOBS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-organization-membership-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.GET_WEBHOOKS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        fetching: {
                            message: `${i18n.t('notifications.webhooks.GET_WEBHOOKS_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-get-webhooks-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.CREATE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        creating: {
                            message: `${i18n.t('notifications.webhooks.CREATE_WEBHOOK_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-create-webhook-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.UPDATE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        updating: {
                            message: `${i18n.t('notifications.webhooks.UPDATE_WEBHOOK_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-webhook-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.DELETE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        deleting: {
                            message: `${i18n.t('notifications.webhooks.DELETE_WEBHOOK_FAILED')}`,
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-delete-webhook-failed',
                        },
                    },
                },
            };
        }
        case BoundariesActionTypes.RESET_AFTER_ERROR:
        case AuthActionTypes.LOGOUT_SUCCESS: {
            return { ...defaultState };
        }
        default: {
            return state;
        }
    }
}
