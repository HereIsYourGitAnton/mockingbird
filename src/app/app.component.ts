import {Component, inject, signal} from '@angular/core';
import {map, merge, Observable, share, startWith, Subject, switchMap} from "rxjs";
import {AddOrUpdateEndpointPayload} from "../../core/abstract/local-server";
import {HttpStatusCode} from "@angular/common/http";
import {LocalServerFacadeService} from "./services/facade/local-server-facade.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    //#region Deps
    private localServerService: LocalServerFacadeService;
    //TODO: change later with app settings
    private readonly DEFAULT_PORT_NUMBER = 3000;
    //#endregion

    //#region UI Events
    onAddNewEndpointClick$ = new Subject<AddOrUpdateEndpointPayload>();
    onServerStartClick$ = new Subject<void>();
    onServerStopClick$ = new Subject<void>();

    $port = signal(this.DEFAULT_PORT_NUMBER);
    $jsonChange = signal('');
    $controllerName = signal('')

    onSaveClick$ = new Subject<void>()
    //#endregion

    //#region Local Server Events
    onNewEndpointAdded$:        ReturnType<LocalServerFacadeService['addOrUpdateEndpoint']>;
    onServerStarted$:           ReturnType<LocalServerFacadeService['start']>;
    onServerStopped$:           ReturnType<LocalServerFacadeService['stop']>;
    onAddOrUpdateEndpoint$:     ReturnType<LocalServerFacadeService['addOrUpdateEndpoint']>;

    //#endregion

    isServerRunning$: Observable<boolean>;

    constructor(
    ) {
        //#region Deps init
        this.localServerService = inject(LocalServerFacadeService)

        //#endregion

        //#region Observables Init
        this.onNewEndpointAdded$ = this.onAddNewEndpointClick$
            .pipe(
                switchMap((payload) => this.localServerService.addOrUpdateEndpoint(payload)),
                share()
            )

        this.onServerStarted$ = this.onServerStartClick$.pipe(
            switchMap(() => this.localServerService.start(this.$port())),
            share()
        )

        this.onServerStopped$ = this.onServerStopClick$.pipe(
            switchMap(() => this.localServerService.stop()),
            share()
        )

        this.onAddOrUpdateEndpoint$ = this.onSaveClick$.pipe(
            switchMap(() => this.localServerService.addOrUpdateEndpoint({
                endpoint: this.$controllerName(),
                config: {
                    statusCode: HttpStatusCode.Ok,
                    method: "GET",
                    body: {kind: 'plain', data: this.$jsonChange()}
                }
            }))
        )

        this.isServerRunning$ = merge(
            this.onServerStarted$.pipe(map((r) => r.isOk())),
            this.onServerStopped$.pipe((map((r) => r.isOk()))),
        ).pipe(
            startWith(false)
        )

        //#endregion

        //#region Observers Init

        this.onNewEndpointAdded$.subscribe((result) => {
            console.log('component onNewEndpointAdded$: ', result)
        })

        this.onServerStarted$.subscribe((result) => {
            console.log('component onServerStarted$: ', result)
        })

        this.onServerStopped$.subscribe((result) => {
            console.log('component onServerStopped$: ', result)
        })

        this.onAddOrUpdateEndpoint$.subscribe((result) => {
            console.log('component onAddOrUpdateEndpoint$: ', result)
        })

        //#endregion
    }

    start() {
        this.onServerStartClick$.next()
    }

    stop() {
        this.onServerStopClick$.next()
    }

    onPortChange(evt: Event) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.$port.set(evt.target['value'])
    }

    onControllerNameChange(evt: Event) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.$controllerName.set(evt.target['value'])
    }

    onJSONChange(evt: Event) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.$jsonChange.set(evt.target['value'])
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSaveClick($event: MouseEvent) {
        this.onSaveClick$.next()
    }
}
