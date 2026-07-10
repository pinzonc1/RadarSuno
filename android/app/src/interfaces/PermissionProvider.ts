export interface PermissionProvider {

    requestAllPermissions(): Promise<boolean>;

    hasAllPermissions(): Promise<boolean>;

    checkMissionReady(): Promise<boolean>;

    getMissionStatus(): Promise<any>;

}