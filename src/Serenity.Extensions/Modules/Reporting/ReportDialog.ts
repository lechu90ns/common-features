import { ReportRetrieveResult } from "@/ServerTypes/Reporting";
import { Decorators, PropertyGrid, TemplatedDialog, WidgetProps, faIcon, resolveUrl, serviceCall } from "@serenity-is/corelib";
import { ReportHelper } from "./ReportHelper";

@Decorators.registerClass("Serenity.Extensions.ReportDialog")
export class ReportDialog<P extends ReportDialogOptions = ReportDialogOptions> extends TemplatedDialog<P> {

    private report: ReportRetrieveResult;
    private propertyGrid: PropertyGrid;

    constructor(props: WidgetProps<P>) {
        super(props);

        this.updateInterface();
        this.loadReport(this.options.reportKey);
    }

    protected getDialogButtons() {
        return null;
    }

    protected createPropertyGrid() {
        this.propertyGrid && this.byId('PropertyGrid').empty().class('');
        this.propertyGrid = new PropertyGrid({
            element: this.byId('PropertyGrid'),
            idPrefix: this.idPrefix,
            useCategories: true,
            items: this.report.Properties
        }).init();
    }

    protected loadReport(reportKey: string) {
        serviceCall({
            url: resolveUrl('~/Serenity.Extensions/Report/Retrieve'),
            request: {
                ReportKey: reportKey
            },
            onSuccess: response => {
                this.report = response as ReportRetrieveResult;
                this.dialogTitle = this.report.Title;
                this.createPropertyGrid();
                this.propertyGrid.load(this.report.InitialSettings || {});
                this.updateInterface();
                this.dialogOpen();
            }
        });
    }

    protected updateInterface() {
        this.toolbar.findButton('print-preview-button')
            .toggle(this.report && !this.report.IsDataOnlyReport && !this.report.IsExternalReport);

        this.toolbar.findButton('run-button')
            .toggle(this.report && this.report.IsExternalReport);

        this.toolbar.findButton('export-pdf-button')
            .toggle(this.report && !this.report.IsDataOnlyReport && !this.report.IsExternalReport);

        this.toolbar.findButton('export-xlsx-button')
            .toggle(this.report && this.report.IsDataOnlyReport && !this.report.IsExternalReport);
    }

    executeReport(target: string, ext: string, download: boolean) {
        if (!this.validateForm()) {
            return;
        }

        var opt = {};
        this.propertyGrid.save(opt);
        ReportHelper.execute({
            download: download,
            reportKey: this.report.ReportKey,
            extension: ext as any,
            target: target,
            params: opt
        });
    }

    getToolbarButtons() {
        return [
            {
                title: 'Preview',
                cssClass: 'print-preview-button',
                onClick: () => this.executeReport('_blank', null, false)
            },
            {
                title: 'Run',
                cssClass: 'run-button',
                icon: faIcon("print", "blue"),
                onClick: () => this.executeReport('_blank', null, false)
            },
            {
                title: 'PDF',
                cssClass: 'export-pdf-button',
                onClick: () => this.executeReport('_blank', 'pdf', true)
            },
            {
                title: 'Excel',
                cssClass: 'export-xlsx-button',
                onClick: () => this.executeReport('_blank', 'xlsx', true)
            }
        ];
    }

    getTemplate() {
        return `<div class="s-DialogContent">
<div id="~_Toolbar" class="s-DialogToolbar">
</div>
<div class="s-Form">
    <form id="~_Form" action="">
        <div class="fieldset ui-widget ui-widget-content ui-corner-all">
            <div id="~_PropertyGrid"></div>
            <div class="clear"></div>
        </div>
    </form>
</div>
</div>`;

    }
}

export interface ReportDialogOptions {
    reportKey: string;
}