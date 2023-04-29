export default function fakeMarkdownContent() {
    return '# Laravel Pennant\n' +
        '![](https://lh3.googleusercontent.com/pw/AMWts8DQfQdZ3Akq2MiQdfZwauWPKjUN-Zj4aWTegARAmW6lVz9eXDfn0k8J1yVrc1PCDy-rJTwu8Tu5Ary_jDskPaeSsD_3CF4irxtbw2WLJezhL7DSrTj1kZOvKsoa_7vRq2Gb3Lww2AafbTAOPhtZWXV9aw=w2200-h1100-no?authuser=0)\n' +
        '## # Introduction\n' +
        '簡單來說 Pennant 可以在 APP 層級做 A/B test, 快速的上新的測試功能並快速拿掉\n' +
        '\n' +
        '## # Installation\n' +
        '```\n' +
        'composer require laravel/pennant\n' +
        '```\n' +
        '```\n' +
        'php artisan vendor:publish --provider="Laravel\\Pennant\\PennantServiceProvider"\n' +
        '```\n' +
        '```\n' +
        'php artisan migrate\n' +
        '```\n' +
        '\n' +
        '## # Configuration\n' +
        'Pennant resolved 過的 feature flag 會存在 array or database, 預設是 database\n' +
        '>Pennant resolved 過的 feature flag 會存在 array or database, 預設是 database\n' +
        '\n' +
        '## # Defining Features\n' +
        '可在 Service Provider 中使用 define method 來定義 feature\n' +
        '- arg1: feature name\n' +
        '- arg2: closure, 帶入的是 scope, 常見的像是 user, closure 會 return boolean, 以判斷 user 是否套用該 feature\n' +
        '- 在初次判斷後, resolved 的結果會被存起來, 所以下次該 user 的 request 就不需要在 resolved 一次, 確保行為是一致的, 不會在不同的 feature 之前跳來跳去的\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Providers;\n' +
        ' \n' +
        'use App\\Models\\User;\n' +
        'use Illuminate\\Support\\Lottery;\n' +
        'use Illuminate\\Support\\ServiceProvider;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class AppServiceProvider extends ServiceProvider\n' +
        '{\n' +
        '    /**\n' +
        '     * Bootstrap any application services.\n' +
        '     */\n' +
        '    public function boot(): void\n' +
        '    {\n' +
        '        Feature::define(\'new-api\', fn (User $user) => match (true) {\n' +
        '            $user->isInternalTeamMember() => true,\n' +
        '            $user->isHighTrafficCustomer() => false,\n' +
        '            default => Lottery::odds(1 / 100),\n' +
        '        });\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '承上, 如果只是簡單使用 lottery, 可以簡化如下\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::define(\'site-redesign\', Lottery::odds(1, 1000));\n' +
        '```\n' +
        '\n' +
        '### # Class Based Features\n' +
        '也可以使用 class based feature, 就不用定義在 service provider, 可以使用以下的 command 建立 class based feature\n' +
        '```\n' +
        'php artisan pennant:feature NewApi\n' +
        '```\n' +
        '\n' +
        '建立後, feature 會被置於 `app/Features`\n' +
        '\n' +
        'class based feature 中, 要定義 resolved method 來 resolved scope\n' +
        '\n' +
        'feature class 是由 container resolved, 所以可以在 constructor 中 inject dependency\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Features;\n' +
        ' \n' +
        'use Illuminate\\Support\\Lottery;\n' +
        ' \n' +
        'class NewApi\n' +
        '{\n' +
        '    /**\n' +
        '     * Resolve the feature\'s initial value.\n' +
        '     */\n' +
        '    public function resolve(User $user): mixed\n' +
        '    {\n' +
        '        return match (true) {\n' +
        '            $user->isInternalTeamMember() => true,\n' +
        '            $user->isHighTrafficCustomer() => false,\n' +
        '            default => Lottery::odds(1 / 100),\n' +
        '        };\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '## # Checking Features\n' +
        '可以使用 active method 來判斷該 feature 是否 active, 在以下的 example 中, 如果判定為 active 的話, 就使用 newApi, 否則則使用 legacyApi\n' +
        '以下 example 是 closure based feature\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Http\\Controllers;\n' +
        ' \n' +
        'use Illuminate\\Http\\Request;\n' +
        'use Illuminate\\Http\\Response;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class PodcastController\n' +
        '{\n' +
        '    /**\n' +
        '     * Display a listing of the resource.\n' +
        '     */\n' +
        '    public function index(Request $request): Response\n' +
        '    {\n' +
        '        return Feature::active(\'new-api\')\n' +
        '                ? $this->resolveNewApiResponse($request)\n' +
        '                : $this->resolveLegacyApiResponse($request);\n' +
        '    }\n' +
        ' \n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '預設的話, feature 的確認目標是登入的使用者, 但也可以使用 for method 特別指定特定 user\n' +
        '若是在 artisan command 內使用 feature, 因為沒有 default auth user, 所以必須使用 for method\n' +
        '```php\n' +
        '<?php\n' +
        'return Feature::for($user)->active(\'new-api\')\n' +
        '        ? $this->resolveNewApiResponse($request)\n' +
        '        : $this->resolveLegacyApiResponse($request);\n' +
        '```\n' +
        '\n' +
        'Feature facade 同時也提供了很多 convenience method\n' +
        '```php\n' +
        '<?php\n' +
        '// Determine if all of the given features are active...\n' +
        'Feature::allAreActive([\'new-api\', \'site-redesign\']);\n' +
        ' \n' +
        '// Determine if any of the given features are active...\n' +
        'Feature::someAreActive([\'new-api\', \'site-redesign\']);\n' +
        ' \n' +
        '// Determine if a feature is inactive...\n' +
        'Feature::inactive(\'new-api\');\n' +
        ' \n' +
        '// Determine if all of the given features are inactive...\n' +
        'Feature::allAreInactive([\'new-api\', \'site-redesign\']);\n' +
        ' \n' +
        '// Determine if any of the given features are inactive...\n' +
        'Feature::someAreInactive([\'new-api\', \'site-redesign\']);\n' +
        '```\n' +
        '\n' +
        '#### # Checking Class Based Features\n' +
        '如果是 class based feature, 在 active method 中須帶入 class name\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Http\\Controllers;\n' +
        ' \n' +
        'use App\\Features\\NewApi;\n' +
        'use Illuminate\\Http\\Request;\n' +
        'use Illuminate\\Http\\Response;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class PodcastController\n' +
        '{\n' +
        '    /**\n' +
        '     * Display a listing of the resource.\n' +
        '     */\n' +
        '    public function index(Request $request): Response\n' +
        '    {\n' +
        '        return Feature::active(NewApi::class)\n' +
        '                ? $this->resolveNewApiResponse($request)\n' +
        '                : $this->resolveLegacyApiResponse($request);\n' +
        '    }\n' +
        ' \n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '### # Conditional Execution\n' +
        '也可以使用 when method 來判斷, 當 active 時會執行 arg2 closure, 否則執行 arg3 closure\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Http\\Controllers;\n' +
        ' \n' +
        'use App\\Features\\NewApi;\n' +
        'use Illuminate\\Http\\Request;\n' +
        'use Illuminate\\Http\\Response;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class PodcastController\n' +
        '{\n' +
        '    /**\n' +
        '     * Display a listing of the resource.\n' +
        '     */\n' +
        '    public function index(Request $request): Response\n' +
        '    {\n' +
        '        return Feature::active(NewApi::class)\n' +
        '                ? $this->resolveNewApiResponse($request)\n' +
        '                : $this->resolveLegacyApiResponse($request);\n' +
        '    }\n' +
        ' \n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '\n' +
        'unless method 跟 when 剛好是相反的, inactive 則執行 arg2 closure, 否則則執行 arg3 closure\n' +
        '```php\n' +
        '<?php\n' +
        'return Feature::unless(NewApi::class,\n' +
        '    fn () => $this->resolveLegacyApiResponse($request),\n' +
        '    fn () => $this->resolveNewApiResponse($request),\n' +
        ');\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # The HasFeatures Trait\n' +
        '任何 model 都可以加上 HasFeatures trait, 然後可以使用 trait 提供的 method\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Models;\n' +
        ' \n' +
        'use Illuminate\\Foundation\\Auth\\User as Authenticatable;\n' +
        'use Laravel\\Pennant\\Concerns\\HasFeatures;\n' +
        ' \n' +
        'class User extends Authenticatable\n' +
        '{\n' +
        '    use HasFeatures;\n' +
        ' \n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '```php\n' +
        '<?php\n' +
        'if ($user->features()->active(\'new-api\')) {\n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '```php\n' +
        '<?php\n' +
        '// Values...\n' +
        '$value = $user->features()->value(\'purchase-button\')\n' +
        '$values = $user->features()->values([\'new-api\', \'purchase-button\']);\n' +
        ' \n' +
        '// State...\n' +
        '$user->features()->active(\'new-api\');\n' +
        '$user->features()->allAreActive([\'new-api\', \'server-api\']);\n' +
        '$user->features()->someAreActive([\'new-api\', \'server-api\']);\n' +
        ' \n' +
        '$user->features()->inactive(\'new-api\');\n' +
        '$user->features()->allAreInactive([\'new-api\', \'server-api\']);\n' +
        '$user->features()->someAreInactive([\'new-api\', \'server-api\']);\n' +
        ' \n' +
        '// Conditional execution...\n' +
        '$user->features()->when(\'new-api\',\n' +
        '    fn () => /* ... */,\n' +
        '    fn () => /* ... */,\n' +
        ');\n' +
        ' \n' +
        '$user->features()->unless(\'new-api\',\n' +
        '    fn () => /* ... */,\n' +
        '    fn () => /* ... */,\n' +
        ');\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Blade Directive\n' +
        '也有 blade 專用的 feature directive\n' +
        '```php\n' +
        '<?php\n' +
        '@feature(\'site-redesign\')\n' +
        '    <!-- \'site-redesign\' is active -->\n' +
        '@else\n' +
        '    <!-- \'site-redesign\' is inactive -->\n' +
        '@endfeature\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Middleware\n' +
        'Pennant 也有提供唯有 feature active 時才可通過的 middleware, 若 inactive 則會返回 400, 須先在 `app/Http/Kernel.php` 加入 middleware alias `EnsureFeaturesAreActive`\n' +
        '```php\n' +
        '<?php\n' +
        'use Laravel\\Pennant\\Middleware\\EnsureFeaturesAreActive;\n' +
        ' \n' +
        'protected $middlewareAliases = [\n' +
        '    // ...\n' +
        '    \'features\' => EnsureFeaturesAreActive::class,\n' +
        '];\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'Route::get(\'/api/servers\', function () {\n' +
        '    // ...\n' +
        '})->middleware([\'features:new-api,servers-api\']);\n' +
        '```\n' +
        '#### # Customizing The Response\n' +
        '也可客製化 `EnsureFeaturesAreActive` middleware 的 inactive response, 比如我不想回 400, 我想要回 403\n' +
        '```php\n' +
        '<?php\n' +
        'use Illuminate\\Http\\Request;\n' +
        'use Illuminate\\Http\\Response;\n' +
        'use Laravel\\Pennant\\Middleware\\EnsureFeaturesAreActive;\n' +
        ' \n' +
        '/**\n' +
        ' * Bootstrap any application services.\n' +
        ' */\n' +
        'public function boot(): void\n' +
        '{\n' +
        '    EnsureFeaturesAreActive::whenInactive(\n' +
        '        function (Request $request, array $features) {\n' +
        '            return new Response(status: 403);\n' +
        '        }\n' +
        '    );\n' +
        ' \n' +
        '    // ...\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # In-Memory Cache\n' +
        '可以清掉 in-memory cache\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::flushCache();\n' +
        '```\n' +
        '\n' +
        '\n' +
        '## # Scope\n' +
        '### # Specifying The Scope\n' +
        '常見的 feature scope 會是 authenticated user, 但可以使用 for method 來指定\n' +
        '```php\n' +
        '<?php\n' +
        'return Feature::for($user)->active(\'new-api\')\n' +
        '        ? $this->resolveNewApiResponse($request)\n' +
        '        : $this->resolveLegacyApiResponse($request);\n' +
        '```\n' +
        '\n' +
        '定義 feature 時, 也可以任意指定要判斷的對象, 比如下面範例的對象就是 $team\n' +
        '```php\n' +
        '<?php\n' +
        'use App\\Models\\Team;\n' +
        'use Carbon\\Carbon;\n' +
        'use Illuminate\\Support\\Lottery;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'Feature::define(\'billing-v2\', function (Team $team) {\n' +
        '    if ($team->created_at->isAfter(new Carbon(\'1st Jan, 2023\'))) {\n' +
        '        return true;\n' +
        '    }\n' +
        ' \n' +
        '    if ($team->created_at->isAfter(new Carbon(\'1st Jan, 2019\'))) {\n' +
        '        return Lottery::odds(1 / 100);\n' +
        '    }\n' +
        ' \n' +
        '    return Lottery::odds(1 / 1000);\n' +
        '});\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'if (Feature::for($user->team)->active(\'billing-v2\')) {\n' +
        '    return redirect()->to(\'/billing/v2\');\n' +
        '}\n' +
        ' \n' +
        '// ...\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Default Scope\n' +
        '可以定義 default 的 scope, 這樣在不使用 for method 時, 會使用 default scope\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Providers;\n' +
        ' \n' +
        'use Illuminate\\Support\\Facades\\Auth;\n' +
        'use Illuminate\\Support\\ServiceProvider;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class AppServiceProvider extends ServiceProvider\n' +
        '{\n' +
        '    /**\n' +
        '     * Bootstrap any application services.\n' +
        '     */\n' +
        '    public function boot(): void\n' +
        '    {\n' +
        '        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);\n' +
        ' \n' +
        '        // ...\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::active(\'billing-v2\');\n' +
        ' \n' +
        '// Is now equivalent to...\n' +
        ' \n' +
        'Feature::for($user->team)->active(\'billing-v2\');\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Nullable Scope\n' +
        '如果 scope 為 null, Pennant 會自動 return false as the result of feature defination, 若 scope 可能為 null 且 null 也要進一步判斷的話, 就要把. null 納入 type\n' +
        '通常在 artisan command, queue job, 或 unauthenticated route 中, scope 都可能為 null\n' +
        '```php\n' +
        '<?php\n' +
        'use App\\Models\\User;\n' +
        'use Illuminate\\Support\\Lottery;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'Feature::define(\'new-api\', fn (User $user) => match (true) {\n' +
        'Feature::define(\'new-api\', fn (User|null $user) => match (true) {\n' +
        '    $user === null => true,\n' +
        '    $user->isInternalTeamMember() => true,\n' +
        '    $user->isHighTrafficCustomer() => false,\n' +
        '    default => Lottery::odds(1 / 100),\n' +
        '});\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Identifying Scope\n' +
        'Pennant 的預設 driver 是 database, 而 Pennant 知道怎麼儲存 Eloquent Model 到 database driver, 然而, 如果是使用自定義的 driver 的話, 該 driver 不見得會認得 Eloquent Model, 遇到這種情境時, 可 implement FeatureScopeable interface, 然後藉由 toFeatureIdentifier method 來定義要存到指定 driver 需要的資料格式\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Models;\n' +
        ' \n' +
        'use FlagRocket\\FlagRocketUser;\n' +
        'use Illuminate\\Database\\Eloquent\\Model;\n' +
        'use Laravel\\Pennant\\Contracts\\FeatureScopeable;\n' +
        ' \n' +
        'class User extends Model implements FeatureScopeable\n' +
        '{\n' +
        '    /**\n' +
        '     * Cast the object to a feature scope identifier for the given driver.\n' +
        '     */\n' +
        '    public function toFeatureIdentifier(string $driver): mixed\n' +
        '    {\n' +
        '        return match($driver) {\n' +
        '            \'database\' => $this,\n' +
        '            \'flag-rocket\' => FlagRocketUser::fromId($this->flag_rocket_id),\n' +
        '        };\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '\n' +
        '## # Rich Feature Values\n' +
        'feature 不一定只能 return boolean, 也可以 return 多個不同的 string\n' +
        '比方說, 我們在測試一個按鈕有三種不同的顏色\n' +
        '```php\n' +
        '<?php\n' +
        'use Illuminate\\Support\\Arr;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'Feature::define(\'purchase-button\', fn (User $user) => Arr::random([\n' +
        '    \'blue-sapphire\',\n' +
        '    \'seafoam-green\',\n' +
        '    \'tart-orange\',\n' +
        ']));\n' +
        '```\n' +
        '\n' +
        '可以使用 value method 來取得當前 scope 的 feature value\n' +
        '```php\n' +
        '<?php\n' +
        '$color = Feature::value(\'purchase-button\');\n' +
        '```\n' +
        '\n' +
        'blade 中也有相對應的 directive 可以用\n' +
        '```php\n' +
        '<?php\n' +
        '@feature(\'purchase-button\', \'blue-sapphire\')\n' +
        '    <!-- \'blue-sapphire\' is active -->\n' +
        '@elsefeature(\'purchase-button\', \'seafoam-green\')\n' +
        '    <!-- \'seafoam-green\' is active -->\n' +
        '@elsefeature(\'purchase-button\', \'tart-orange\')\n' +
        '    <!-- \'tart-orange\' is active -->\n' +
        '@endfeature\n' +
        '```\n' +
        '\n' +
        '需注意, 當使用 Rich Feature Value 時, 所有 false 之外的 string 都會被解讀為 active, 所以這時如果使用 when or unless method 時, 就會自動選擇相對應的 closure\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::when(\'purchase-button\',\n' +
        '    fn ($color) => /* ... */,\n' +
        '    fn () => /* ... */,\n' +
        ');\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::unless(\'purchase-button\',\n' +
        '    fn () => /* ... */,\n' +
        '    fn ($color) => /* ... */,\n' +
        ');\n' +
        '```\n' +
        '\n' +
        '\n' +
        '## # Retrieving Multiple Features\n' +
        'value method 可以取得多個 feature 的 value\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::values([\'billing-v2\', \'purchase-button\']);\n' +
        ' \n' +
        '// [\n' +
        '//     \'billing-v2\' => false,\n' +
        '//     \'purchase-button\' => \'blue-sapphire\',\n' +
        '// ]\n' +
        '```\n' +
        '\n' +
        '也可使用 all method 取得所有 feature values\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::all();\n' +
        ' \n' +
        '// [\n' +
        '//     \'billing-v2\' => false,\n' +
        '//     \'purchase-button\' => \'blue-sapphire\',\n' +
        '//     \'site-redesign\' => true,\n' +
        '// ]\n' +
        '```\n' +
        '\n' +
        '然而, 因為 class based feature 預設是沒有在 boot 的時候註冊的, 所以使用 all method 時不會取得其 value, 如果想要註冊 class based feature 可以在 boot 中使用 discover method, 這會註冊所有位於 `app/Features` 下面的 features\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Providers;\n' +
        ' \n' +
        'use Illuminate\\Support\\ServiceProvider;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class AppServiceProvider extends ServiceProvider\n' +
        '{\n' +
        '    /**\n' +
        '     * Bootstrap any application services.\n' +
        '     */\n' +
        '    public function boot(): void\n' +
        '    {\n' +
        '        Feature::discover();\n' +
        ' \n' +
        '        // ...\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::all();\n' +
        ' \n' +
        '// [\n' +
        '//     \'App\\Features\\NewApi\' => true,\n' +
        '//     \'billing-v2\' => false,\n' +
        '//     \'purchase-button\' => \'blue-sapphire\',\n' +
        '//     \'site-redesign\' => true,\n' +
        '// ]\n' +
        '```\n' +
        '\n' +
        '## # Eager Loading\n' +
        '如果我們可能會在 loop 中判斷多個 user 的 feature, 那就會執行多個 query, 這時我們可以使用 load method 來 eager loading 來避免多個 query\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::for($users)->load([\'notifications-beta\']);\n' +
        ' \n' +
        'foreach ($users as $user) {\n' +
        '    if (Feature::for($user)->active(\'notifications-beta\')) {\n' +
        '        $user->notify(new RegistrationSuccess);\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::for($users)->loadMissing([\n' +
        '    \'new-api\',\n' +
        '    \'purchase-button\',\n' +
        '    \'notifications-beta\',\n' +
        ']);\n' +
        '```\n' +
        '\n' +
        '\n' +
        '## # Updating Values\n' +
        '如果 feature 已經被 resolved 過了, 也可以透過 `activate` 以及 `deactivate` method 來手動定義 value\n' +
        '```php\n' +
        '<?php\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        '// Activate the feature for the default scope...\n' +
        'Feature::activate(\'new-api\');\n' +
        ' \n' +
        '// Deactivate the feature for the given scope...\n' +
        'Feature::for($user->team)->deactivate(\'billing-v2\');\n' +
        '```\n' +
        '\n' +
        'Rich Value 也可以手動定義\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::activate(\'purchase-button\', \'seafoam-green\');\n' +
        '```\n' +
        '\n' +
        '也可以忘記之前 resolved 的紀錄\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::forget(\'purchase-button\');\n' +
        '```\n' +
        '\n' +
        '### # Bulk Updates\n' +
        '如果一次要修改所有 feature value 的話, 可以使用 `activateForEveryone` 以及 `deactivateForEveryone` method\n' +
        '這只會修改 resolved 過的 feature value 而已, 還沒 resolved 過的不會有效果\n' +
        '```php\n' +
        '<?php\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'Feature::activateForEveryone(\'new-api\');\n' +
        ' \n' +
        'Feature::activateForEveryone(\'purchase-button\', \'seafoam-green\');\n' +
        '```\n' +
        '\n' +
        '\n' +
        '### # Purging Features\n' +
        '在有些情境, 比如我們以及移除掉某個 feature, 或是我們針對現有的 feature 做了一些修改, 而我們想要重新的 resolve, 這時我們可以使用 `purge` method 來清掉指定 feature 所有 resolved 的資料\n' +
        '```php\n' +
        '<?php\n' +
        '// Purging a single feature...\n' +
        'Feature::purge(\'new-api\');\n' +
        ' \n' +
        '// Purging multiple features...\n' +
        'Feature::purge([\'new-api\', \'purchase-button\']);\n' +
        '```\n' +
        '\n' +
        '當然, 也可以清掉所有 feature 所有的 resolved 資料\n' +
        '```php\n' +
        '<?php\n' +
        'Feature::purge();\n' +
        '```\n' +
        '\n' +
        '有些情境, 我們會需要在 deployment 時 purge features, Pennant 也有提供 artisan command\n' +
        '```\n' +
        'php artisan pennant:purge new-api\n' +
        ' \n' +
        'php artisan pennant:purge new-api purchase-button\n' +
        '```\n' +
        '\n' +
        '## # Testing\n' +
        '測試時, 儘管 feature 可能已經定義在 service provider, 我們還是可以修改 feature defination, 只需要在測試中重新定義一次即可\n' +
        '假設我們在 service provider 中已經有 defination\n' +
        '```php\n' +
        '<?php\n' +
        'use Illuminate\\Support\\Arr;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'Feature::define(\'purchase-button\', fn () => Arr::random([\n' +
        '    \'blue-sapphire\',\n' +
        '    \'seafoam-green\',\n' +
        '    \'tart-orange\',\n' +
        ']));\n' +
        '```\n' +
        '\n' +
        '在測試中, 可重新定義\n' +
        '```php\n' +
        '<?php\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'public function test_it_can_control_feature_values()\n' +
        '{\n' +
        '    Feature::define(\'purchase-button\', \'seafoam-green\');\n' +
        ' \n' +
        '    $this->assertSame(\'seafoam-green\', Feature::value(\'purchase-button\'));\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '```php\n' +
        '<?php\n' +
        'use App\\Features\\NewApi;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'public function test_it_can_control_feature_values()\n' +
        '{\n' +
        '    Feature::define(NewApi::class, true);\n' +
        ' \n' +
        '    $this->assertTrue(Feature::value(NewApi::class));\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '如果 feature return Lottery instance, 可以使用 Lottery 的 testing method\n' +
        '[文件連結](https://laravel.com/docs/10.x/helpers#testing-lotteries)\n' +
        '\n' +
        '### # Stored Configuration\n' +
        '可在 phpunit.xml file 中, 定義 Pennant 使用的 store driver\n' +
        '```php\n' +
        '<?php\n' +
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<phpunit colors="true">\n' +
        '    <!-- ... -->\n' +
        '    <php>\n' +
        '        <env name="PENNANT_STORE" value="array"/>\n' +
        '        <!-- ... -->\n' +
        '    </php>\n' +
        '</phpunit>\n' +
        '```\n' +
        '\n' +
        '## # Adding Custom Pennant Drivers\n' +
        '### # Implementing The Driver\n' +
        '如果想要自定義 Pennant custom store driver 也是可以的, 必須 implement `Laravel\\Pennant\\Contracts\\Driver` contract\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Extensions;\n' +
        ' \n' +
        'use Laravel\\Pennant\\Contracts\\Driver;\n' +
        ' \n' +
        'class RedisFeatureDriver implements Driver\n' +
        '{\n' +
        '    public function define(string $feature, callable $resolver): void {}\n' +
        '    public function defined(): array {}\n' +
        '    public function getAll(array $features): array {}\n' +
        '    public function get(string $feature, mixed $scope): mixed {}\n' +
        '    public function set(string $feature, mixed $scope, mixed $value): void {}\n' +
        '    public function setForAllScopes(string $feature, mixed $value): void {}\n' +
        '    public function delete(string $feature, mixed $scope): void {}\n' +
        '    public function purge(array|null $features): void {}\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '### # Registering The Driver\n' +
        '定義好 Pennant custom store driver 之後, 可以在 service provider 中的 boot method 中, 使用 extend method 來註冊 driver\n' +
        '```php\n' +
        '<?php\n' +
        ' \n' +
        'namespace App\\Providers;\n' +
        ' \n' +
        'use App\\Extensions\\RedisFeatureDriver;\n' +
        'use Illuminate\\Contracts\\Foundation\\Application;\n' +
        'use Illuminate\\Support\\ServiceProvider;\n' +
        'use Laravel\\Pennant\\Feature;\n' +
        ' \n' +
        'class AppServiceProvider extends ServiceProvider\n' +
        '{\n' +
        '    /**\n' +
        '     * Register any application services.\n' +
        '     */\n' +
        '    public function register(): void\n' +
        '    {\n' +
        '        // ...\n' +
        '    }\n' +
        ' \n' +
        '    /**\n' +
        '     * Bootstrap any application services.\n' +
        '     */\n' +
        '    public function boot(): void\n' +
        '    {\n' +
        '        Feature::extend(\'redis\', function (Application $app) {\n' +
        '            return new RedisFeatureDriver($app->make(\'redis\'), $app->make(\'events\'), []);\n' +
        '        });\n' +
        '    }\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '然後就可以在 Pennant config 中使用註冊好的 driver\n' +
        '```php\n' +
        '<?php\n' +
        '\'stores\' => [\n' +
        ' \n' +
        '    \'redis\' => [\n' +
        '        \'driver\' => \'redis\',\n' +
        '        \'connection\' => null,\n' +
        '    ],\n' +
        ' \n' +
        '    // ...\n' +
        ' \n' +
        '],\n' +
        '```\n' +
        '\n' +
        '\n' +
        '## # Events\n' +
        'Pennant 會在各種情境觸發不同的 event, 文件寫的是 `Laravel\\Pennant\\Events\\RetrievingKnownFeature`, 不過我追了一下 source code, 發現不太一樣, 可能文件還沒更新到最新版本, 以下採用 source code 中定義的 event\n' +
        '\n' +
        '- Laravel\\Pennant\\Events\\FeatureRetrieved\n' +
        '每次的 request 中, 首次有已定義的 feature retrieve 時, 都會觸發這個 event, 如果要統計該 feature 被觸發幾次的話, 這非常有用\n' +
        '\n' +
        '- Laravel\\Pennant\\Events\\FeatureResolved\n' +
        '只有在 resolved 時才會觸發, 如果要統計該 feature 總共被幾個使用者 resolved 的話, 應該有用\n' +
        '\n' +
        '- Laravel\\Pennant\\Events\\UnknownFeatureResolved\n' +
        '如果 resolve 未定義的 feature 會觸發。 可以藉由這個 event 來判斷, 有沒有早已移除掉的 feature 定義, 但引用的地方沒有移除乾淨\n'
}