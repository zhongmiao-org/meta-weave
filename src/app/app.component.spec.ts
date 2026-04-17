import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNgxLowcodeMaterials } from '@zhongmiao/ngx-lowcode-materials';
import { AppComponent } from './app.component';

describe('app bootstrap shell', () => {
  let fixture: ComponentFixture<AppComponent> | null = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNgxLowcodeMaterials(),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    TestBed.resetTestingModule();
  });

  it('creates app component without hanging runtime providers', async () => {
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
