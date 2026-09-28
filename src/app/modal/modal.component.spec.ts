import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ModalComponent } from './modal.component';
import { AppStrings } from '../app-strings';

// A host that drives one pop-up the way GameComponent and SandboxComponent do:
// a boolean bound to [open], reset in (closed).
@Component({
  template: `
    <app-modal [open]="open" titleId="test-title" [initialFocus]="focusSecond ? second : null"
      (closed)="onClosed()">
      <h2 modal-title id="test-title">Title</h2>
      <p class="body-line">Body</p>
      <div class="tall" [style.height.px]="tallPx"></div>
      <button #second type="button" class="second">Second</button>
      <footer modal-footer>
        <button type="button" class="action">Action</button>
      </footer>
    </app-modal>`
})
class HostComponent {
  open = false;
  focusSecond = false;
  tallPx = 0;
  closedCount = 0;
  onClosed() {
    this.closedCount++;
    this.open = false;
  }
}

describe('ModalComponent (#31)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let modal: ModalComponent;

  const dialog = () => fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  const closeButton = () => dialog().querySelector('header button') as HTMLButtonElement;

  function setOpen(open: boolean) {
    host.open = open;
    fixture.detectChanges();
  }

  // A click on the backdrop reaches the <dialog> itself: press, release and
  // click all land on it.
  function clickBackdrop() {
    for (const type of ['mousedown', 'mouseup', 'click']) {
      dialog().dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
  }

  // The native close event is queued as a task after close(); wait for it
  // (and its handlers) before counting (closed). Call before closing.
  const closeEvent = () => new Promise<void>(resolve =>
    dialog().addEventListener('close', () => setTimeout(resolve), { once: true }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalComponent, HostComponent ]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    modal = fixture.debugElement.query(By.directive(ModalComponent)).componentInstance;
  });

  afterEach(() => {
    if (dialog()?.open) {
      dialog().close();
    }
  });

  it('renders a closed native <dialog> by default', () => {
    expect(dialog()).toBeTruthy();
    expect(dialog().open).toBeFalse();
  });

  it('opens as a modal through [open] and closes when [open] goes false', () => {
    setOpen(true);
    expect(dialog().open).toBeTrue();
    expect(dialog().matches(':modal')).toBeTrue();

    setOpen(false);
    expect(dialog().open).toBeFalse();
  });

  it('does not emit (closed) when the parent closes it', async () => {
    setOpen(true);
    const closing = closeEvent();
    setOpen(false);
    await closing;
    expect(host.closedCount).toBe(0);
  });

  it('does nothing when asked to open while already open', () => {
    setOpen(true);
    const showModal = spyOn(dialog(), 'showModal').and.callThrough();
    // Another input change re-syncs the open dialog.
    host.focusSecond = true;
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(() => modal.ngOnChanges()).not.toThrow();
    expect(showModal).not.toHaveBeenCalled();
    expect(dialog().open).toBeTrue();
  });

  it('closes on Esc (cancel) and emits (closed) once', async () => {
    setOpen(true);
    const closing = closeEvent();
    const cancel = new Event('cancel', { cancelable: true });
    dialog().dispatchEvent(cancel);
    fixture.detectChanges();
    await closing;

    expect(cancel.defaultPrevented).toBeTrue();
    expect(dialog().open).toBeFalse();
    expect(host.closedCount).toBe(1);
    expect(host.open).toBeFalse();
  });

  it('closes on a backdrop click and emits (closed) once', async () => {
    setOpen(true);
    const closing = closeEvent();
    clickBackdrop();
    fixture.detectChanges();
    await closing;

    expect(dialog().open).toBeFalse();
    expect(host.closedCount).toBe(1);
  });

  it('stays open on a click inside the box', () => {
    setOpen(true);
    const line = dialog().querySelector('.body-line') as HTMLElement;
    line.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    line.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    line.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog().open).toBeTrue();
    expect(host.closedCount).toBe(0);
  });

  it('stays open when a press inside the box is released on the backdrop', () => {
    setOpen(true);
    const line = dialog().querySelector('.body-line') as HTMLElement;
    line.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    dialog().dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog().open).toBeTrue();
  });

  // Press and release on different elements click their common ancestor,
  // the <dialog>.
  it('stays open when a press on the backdrop is released inside the box', () => {
    setOpen(true);
    const line = dialog().querySelector('.body-line') as HTMLElement;
    dialog().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    line.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog().open).toBeTrue();
    expect(host.closedCount).toBe(0);
  });

  it('closes on the header ✕ and emits (closed) once', async () => {
    setOpen(true);
    const closing = closeEvent();
    closeButton().click();
    fixture.detectChanges();
    await closing;

    expect(dialog().open).toBeFalse();
    expect(host.closedCount).toBe(1);
  });

  it('emits (closed) when the browser closes it on its own', async () => {
    setOpen(true);
    const closing = closeEvent();
    dialog().close();
    await closing;
    expect(host.closedCount).toBe(1);
  });

  it('reopens after a user close', () => {
    setOpen(true);
    closeButton().click();
    fixture.detectChanges();
    setOpen(true);
    expect(dialog().open).toBeTrue();
  });

  it('labels the dialog with its title and the ✕ with "Cerrar"', () => {
    const title = dialog().querySelector('header h2') as HTMLElement;
    expect(title).toBeTruthy();
    expect(dialog().getAttribute('aria-labelledby')).toBe('test-title');
    expect(title.id).toBe('test-title');
    expect(closeButton().getAttribute('aria-label')).toBe(AppStrings.LABEL_CLOSE);
    expect(closeButton().type).toBe('button');
  });

  it('projects the body and the footer', () => {
    expect(dialog().querySelector('article .body-line')).toBeTruthy();
    expect(dialog().querySelector('article > footer .action')).toBeTruthy();
  });

  it('focuses the ✕ on open by default', () => {
    setOpen(true);
    expect(document.activeElement).toBe(closeButton());
  });

  it('focuses the chosen element on open', () => {
    host.focusSecond = true;
    setOpen(true);
    expect(document.activeElement).toBe(dialog().querySelector('.second'));
  });

  // #1 / #31: the look the issue fixes, from src/styles.css and the component
  // styles (both loaded by Karma).
  describe('look', () => {
    it('draws a plain 40% black backdrop with no blur', () => {
      setOpen(true);
      const backdrop = getComputedStyle(dialog(), '::backdrop');
      expect(backdrop.backgroundColor).toBe('rgba(0, 0, 0, 0.4)');
      expect(backdrop.backdropFilter).toBe('none');
    });

    it('keeps a tall pop-up inside the viewport and scrolls its body', () => {
      host.tallPx = 3000;
      setOpen(true);
      const box = dialog().getBoundingClientRect();
      const body = dialog().querySelector('.modal-body') as HTMLElement;
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(innerHeight);
      expect(getComputedStyle(body).overflowY).toBe('auto');
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      const header = dialog().querySelector('header') as HTMLElement;
      const footer = dialog().querySelector('article > footer') as HTMLElement;
      expect(header.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
      expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
    });
  });
});
