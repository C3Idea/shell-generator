import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppStrings } from '../app-strings';

// The shared pop-up (#31): a native <dialog> in the Pico.css v2 modal layout
// (<article> with a <header> holding the title and a ✕, the body, and an
// optional <footer>). The parent binds a boolean to [open] and resets it in
// (closed), which fires when the user closes the pop-up with Esc, a click on
// the backdrop or the ✕. Closing it through [open] emits nothing.
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  // The title, body and footer are projected from the parent, so the styles
  // can't be scoped to this component's view; they're scoped by selector.
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnChanges, AfterViewInit {
  // Id of the projected <h2 modal-title>, which names the dialog.
  @Input() titleId = '';

  // Element focused on open. Without one, the browser focuses the first
  // focusable element: the ✕.
  @Input() initialFocus: HTMLElement | null = null;

  @Input() open = false;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog')
  private dialogRef?: ElementRef<HTMLDialogElement>;

  AppStrings = AppStrings;

  // Set once (closed) has fired for the current opening, so a user close and
  // the native close event that follows it emit only once.
  private closeReported = false;
  // Where the last press started: a drag from inside the box that ends on the
  // backdrop is not a backdrop click.
  private pressedOnBackdrop = false;

  // Synced once all inputs are set, so initialFocus is known on open.
  ngOnChanges(): void {
    this.sync();
  }

  ngAfterViewInit(): void {
    this.sync();
  }

  requestClose(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog?.open) {
      return;
    }
    dialog.close();
    this.reportClosed();
  }

  // Esc: close through the same path as the ✕, so (closed) fires right away.
  onCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  // The browser can still close the dialog itself (a repeated Esc ignores
  // preventDefault), so a close the parent didn't ask for is reported too.
  onNativeClose(): void {
    if (this.open && !this.dialogRef?.nativeElement.open) {
      this.reportClosed();
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.pressedOnBackdrop = event.target === this.dialogRef?.nativeElement;
  }

  // The <dialog> has no padding and the <article> fills it, so a click whose
  // target is the <dialog> itself landed on the backdrop.
  onClick(event: MouseEvent): void {
    const onBackdrop = event.target === this.dialogRef?.nativeElement;
    if (onBackdrop && this.pressedOnBackdrop) {
      this.requestClose();
    }
    this.pressedOnBackdrop = false;
  }

  // Runs on every input change: showModal() throws on a dialog that is
  // already open, so both ways are guarded.
  private sync(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) {
      return;
    }
    if (this.open && !dialog.open) {
      this.closeReported = false;
      dialog.showModal();
      this.initialFocus?.focus();
    }
    else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  private reportClosed(): void {
    if (this.closeReported) {
      return;
    }
    this.closeReported = true;
    this.closed.emit();
  }
}
