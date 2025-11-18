---
description: Rules for Angular development
alwaysApply: false
---

# Règles Angular

## Standalone Components (Angular 17+)

```typescript
// ✅ Bon - Standalone component
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`
})
export class UserComponent {
  // ...
}
```

## Services & Dependency Injection

```typescript
// ✅ Bon - Service injectable
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

## Reactive Forms

```typescript
// ✅ Bon - Reactive forms avec validation
export class UserFormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  
  constructor(private fb: FormBuilder) {}
}
```

## RxJS

```typescript
// ✅ Bon - Gestion des subscriptions
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => this.users = users);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Routing

```typescript
// ✅ Bon - Lazy loading
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component')
      .then(m => m.UsersComponent)
  }
];
```

## Tests

```typescript
// ✅ Bon - Tests avec TestBed
describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [UserService]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Best Practices

1. **OnPush Change Detection** : Utiliser `ChangeDetectionStrategy.OnPush`
2. **TrackBy Functions** : Utiliser `trackBy` dans `*ngFor`
3. **Async Pipe** : Utiliser `async` pipe pour les observables
4. **Interceptors** : Utiliser des interceptors pour les appels HTTP
5. **Guards** : Utiliser des guards pour la protection des routes

