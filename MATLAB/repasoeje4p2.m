%% x[n] = 2δ[n + 2] − δ[n − 4], −5 ≤ n ≤ 5

n=-5:5;
delta= @(n) (n==0);
x= 2* delta(n+2)- delta(n-4);
figure(1);
stem(n,x);

%% **2. Señal x[n] = n[u[n] - u[n-10]] + 10e^{-0.3(n-10)}[u[n-10] - u[n-20]], con 0 ≤ n ≤ 20**

n2= 0:20;
u= @(n) (n>=0);

x2 = n2 .* (u(n2) - u(n2 - 10)) + 10 * exp(-0.3 * (n2 - 10)) .* (u(n2 - 10) - u(n2 - 20));
figure(2)
stem(n2,x2);

%% **3. Señal x[n] = e^{j\pi n/6} + e^{j\pi n/3}, con -10 ≤ n ≤ 10**

n3=-10:10;
x3= exp((j*pi*n3)/6) + exp((j*pi*n3)/3);

parteReal= real(x3);
parteImag= imag(x3);
figure(3);
stem(n3,parteReal);
figure(4);
stem(n3, parteImag);