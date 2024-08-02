export enum ShareFileType {
    DIR = 'DIR',
    REG = 'REG',
}

export enum ChunkType {
    IMAGESET = 'imageset',
    VIDEO = 'video',
}

export enum TaskStatus {
    ANNOTATION = 'annotation',
    VALIDATION = 'validation',
    COMPLETED = 'completed',
}

export type ProjectStatus = TaskStatus;

export enum JobStage {
    ANNOTATION = 'annotation',
    VALIDATION = 'validation',
    ACCEPTANCE = 'acceptance',
}

export enum JobState {
    NEW = 'new',
    IN_PROGRESS = 'in progress',
    COMPLETED = 'completed',
    REJECTED = 'rejected',
}

export enum JobType {
    ANNOTATION = 'annotation',
    GROUND_TRUTH = 'ground_truth',
}

export enum DimensionType {
    DIMENSION_2D = '2d',
    DIMENSION_3D = '3d',
}

export enum RQStatus {
    QUEUED = 'queued',
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
    UNKNOWN = 'unknown',
}

export enum TaskMode {
    ANNOTATION = 'annotation',
    INTERPOLATION = 'interpolation',
}

export enum AttributeType {
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    SELECT = 'select',
    NUMBER = 'number',
    TEXT = 'text',
}

export enum ObjectType {
    TAG = 'tag',
    SHAPE = 'shape',
    TRACK = 'track',
}

export enum ShapeType {
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
    POINTS = 'points',
    ELLIPSE = 'ellipse',
    CUBOID = 'cuboid',
    SKELETON = 'skeleton',
    MASK = 'mask',
}

export enum Source {
    MANUAL = 'manual',
    AUTO = 'auto',
}

export enum LogType {
    loadTool = 'load:cvat',

    loadJob = 'load:job',
    saveJob = 'save:job',
    restoreJob = 'restore:job',
    uploadAnnotations = 'upload:annotations',
    exception = 'send:exception',
    sendTaskInfo = 'send:task_info',
    exitJob = 'exit:job',
    drawObject = 'draw:object',
    pasteObject = 'paste:object',
    copyObject = 'copy:object',
    propagateObject = 'propagate:object',
    dragObject = 'drag:object',
    resizeObject = 'resize:object',
    deleteObject = 'delete:object',
    lockObject = 'lock:object',
    mergeObjects = 'merge:objects',
    changeAttribute = 'change:attribute',
    changeLabel = 'change:label',

    changeFrame = 'change:frame',
    moveImage = 'move:image',
    zoomImage = 'zoom:image',
    fitImage = 'fit:image',
    rotateImage = 'rotate:image',

    undoAction = 'action:undo',
    redoAction = 'action:redo',

    pressShortcut = 'press:shortcut',
    debugInfo = 'send:debug_info',

    clickElement = 'click:element',

    access = 'view:access',
    view = 'view:page',
}

export enum HistoryActions {
    CHANGED_LABEL = 'Changed label',
    CHANGED_ATTRIBUTES = 'Changed attributes',
    CHANGED_POINTS = 'Changed points',
    CHANGED_ROTATION = 'Object rotated',
    CHANGED_OUTSIDE = 'Changed outside',
    CHANGED_OCCLUDED = 'Changed occluded',
    CHANGED_ZORDER = 'Changed z-order',
    CHANGED_KEYFRAME = 'Changed keyframe',
    CHANGED_LOCK = 'Changed lock',
    CHANGED_PINNED = 'Changed pinned',
    CHANGED_COLOR = 'Changed color',
    CHANGED_HIDDEN = 'Changed hidden',
    CHANGED_SOURCE = 'Changed source',
    MERGED_OBJECTS = 'Merged objects',
    SPLITTED_TRACK = 'Splitted track',
    GROUPED_OBJECTS = 'Grouped objects',
    CREATED_OBJECTS = 'Created objects',
    REMOVED_OBJECT = 'Removed object',
    REMOVED_FRAME = 'Removed frame',
    RESTORED_FRAME = 'Restored frame',
}

export enum ModelKind {
    DETECTOR = 'detector',
    INTERACTOR = 'interactor',
    TRACKER = 'tracker',
    CLASSIFIER = 'classifier',
    REID = 'reid',
}

export enum ModelProviders {
    CVAT = 'cvat',
}

export enum ModelReturnType {
    RECTANGLE = 'rectangle',
    TAG = 'tag',
    POLYGON = 'polygon',
    MASK = 'mask',
}

export const colors = [
    '#4970FB',
    '#31D2B5',
    '#FF7E07',
    '#FB2C38',
    '#FFE70F',
    '#91D880',
    '#AC76F1',
    '#49B0FB',
    '#FF32FF',
    '#00FFFF',
    '#9AB0FF',
    '#A3FFF4',
    '#FFBC95',
    '#FB6E77',
    '#FFF9BF',
    '#D0FFC5',
    '#DDC2FF',
    '#B7E1FF',
    '#FFC5FF',
    '#C6FFFF',
    '#0D42FF',
    '#257768',
    '#A44F00',
    '#A72D34',
    '#CBB80A',
    '#1D7806',
    '#5D27A1',
    '#0068B2',
    '#AD0FAD',
    '#008E8E',
];

export enum CloudStorageProviderType {
    AWS_S3_BUCKET = 'AWS_S3_BUCKET',
    AZURE_CONTAINER = 'AZURE_CONTAINER',
    GOOGLE_CLOUD_STORAGE = 'GOOGLE_CLOUD_STORAGE',
}

export enum CloudStorageCredentialsType {
    KEY_SECRET_KEY_PAIR = 'KEY_SECRET_KEY_PAIR',
    ACCOUNT_NAME_TOKEN_PAIR = 'ACCOUNT_NAME_TOKEN_PAIR',
    ANONYMOUS_ACCESS = 'ANONYMOUS_ACCESS',
    KEY_FILE_PATH = 'KEY_FILE_PATH',
}

export enum CloudStorageStatus {
    AVAILABLE = 'AVAILABLE',
    NOT_FOUND = 'NOT_FOUND',
    FORBIDDEN = 'FORBIDDEN',
}

export enum MembershipRole {
    WORKER = 'worker',
    SUPERVISOR = 'supervisor',
    MAINTAINER = 'maintainer',
    OWNER = 'owner',
}

export enum SortingMethod {
    LEXICOGRAPHICAL = 'lexicographical',
    NATURAL = 'natural',
    PREDEFINED = 'predefined',
    RANDOM = 'random',
}

export enum StorageLocation {
    LOCAL = 'local',
    CLOUD_STORAGE = 'cloud_storage',
}

export enum WebhookSourceType {
    ORGANIZATION = 'organization',
    PROJECT = 'project',
}

export enum WebhookContentType {
    JSON = 'application/json',
}

export enum LabelType {
    ANY = 'any',
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
    POINTS = 'points',
    ELLIPSE = 'ellipse',
    CUBOID = 'cuboid',
    SKELETON = 'skeleton',
    MASK = 'mask',
    TAG = 'tag',
}
