import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphingComponent } from './graphing.component';

describe('GraphingComponent', () => {
  let component: GraphingComponent;
  let fixture: ComponentFixture<GraphingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
