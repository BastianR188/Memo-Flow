import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Directive({
  selector: 'textarea[autosizedirectiv]',
  standalone: true
})
export class AutosizeDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  @HostListener('input')
  onInput(): void {
    this.adjust();
  }

  ngAfterViewInit() {
    this.adjust();
  }

  private adjust(): void {
    const textArea = this.elementRef.nativeElement as HTMLTextAreaElement;
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }
}
