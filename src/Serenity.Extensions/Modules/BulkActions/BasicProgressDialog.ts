import { Decorators, DialogTexts, TemplatedDialog, WidgetProps, localText } from "@serenity-is/corelib";

@Decorators.registerClass("Serenity.Extensions.BasicProgressDialog")
export class BasicProgressDialog<P = {}> extends TemplatedDialog<P> {

    constructor(props?: WidgetProps<P>) {
        super(props);

        this.dialogTitle = localText('Site.BasicProgressDialog.PleaseWait');
    }

    public cancelled: boolean;

    public get max(): number {
        return parseInt(this.byId('ProgressBar').attr('aria-valuemax'), 10);
    }

    public set max(value: number) {
        this.byId('ProgressBar').attr('aria-valuemax', (value || 100).toString());
    }

    public get value(): number {
        return parseInt(this.byId('ProgressBar').attr('aria-valuenow'), 10);
    }

    public set value(value: number) {
        this.byId('ProgressBar').attr('aria-valuenow', (value || 0).toString())
            .css('width', (((value || 0) / (this.max || 100)) * 100) + '%')
            .text(value + ' / ' + this.max);
    }

    public get title(): string {
        return this.dialogTitle;
    }

    public set title(value: string) {
        this.dialogTitle = value;
    }

    public cancelTitle: string;

    getDialogButtons() {
        return [{
            text: DialogTexts.CancelButton,
            class: 'btn btn-danger',
            click: () => {
                this.cancelled = true;
                $(this.domNode).closest('.ui-dialog')
                    .find('.ui-dialog-buttonpane .ui-button')
                    .attr('disabled', 'disabled')
                    .css('opacity', '0.5');

                ($(this.domNode) as any).dialog('option', 'title', this.cancelTitle?.trim() ||
                    localText('Site.BasicProgressDialog.CancelTitle'));
            }
        }];
    }

    getDialogOptions() {
        var opt = super.getDialogOptions();
        opt.width = 600;
        return opt;
    }

    initDialog() {
        super.initDialog();
        $(this.domNode).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
    }

    getTemplate() {
        return (
            `<div class="s-DialogContent s-BasicProgressDialogContent">
    <div id="~_StatusText" class="status-text" ></div>
        <div id="~_Progress" class="progress" style="height: 1.5rem">
        <div id="~_ProgressBar" class="progress-bar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
</div>`);
    }
}