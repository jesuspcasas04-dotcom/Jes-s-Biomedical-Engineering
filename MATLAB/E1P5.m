% Ejercicio 1 - Comparación espectral de tres casos


N_full = 256;
N_short = 32;


n1 = 0:N_full-1;
r1 = 6 * sin(2*pi*n1/12);

R1 = fftshift(fft(r1)) / N_full;
w1 = linspace(-pi, pi, N_full);
[max_val1, idx1] = max(abs(R1));
omega1 = w1(idx1);
k1 = (omega1 * N_full) / (2*pi);
f1 = k1 / N_full;
T1 = 1 / f1;


n2 = 0:N_short-1;
r2 = 6 * sin(2*pi*n2/12);

R2 = fftshift(fft(r2)) / N_short;
w2 = linspace(-pi, pi, N_short);
[max_val2, idx2] = max(abs(R2));
omega2 = w2(idx2);
k2 = (omega2 * N_short) / (2*pi);
f2 = k2 / N_short;
T2 = 1 / f2;

% ----------- Caso 3: Señal truncada con zero padding (N = 256) ----------
r3 = [r2 zeros(1, N_full - N_short)];

R3 = fftshift(fft(r3)) / N_full;
w3 = linspace(-pi, pi, N_full);
[max_val3, idx3] = max(abs(R3));
omega3 = w3(idx3);
k3 = (omega3 * N_full) / (2*pi);
f3 = k3 / N_full;
T3 = 1 / f3;

% ----------- Mostrar resultados ----------
fprintf("Periodo estimado - Caso 1 (N=256): %.2f muestras\n", T1);
fprintf("Periodo estimado - Caso 2 (N=32): %.2f muestras\n", T2);
fprintf("Periodo estimado - Caso 3 (N=32+relleno): %.2f muestras\n", T3);

% ----------- Representaciones ----------
figure;
subplot(3,1,1); stem(w1, abs(R1)); title('Caso 1: N = 256');
xlabel('\omega [rad/muestra]'); ylabel('|R(\omega)|');

subplot(3,1,2); stem(w2, abs(R2)); title('Caso 2: N = 32');
xlabel('\omega [rad/muestra]'); ylabel('|R(\omega)|');

subplot(3,1,3); stem(w3, abs(R3)); title('Caso 3: Zero padding hasta N = 256');
xlabel('\omega [rad/muestra]'); ylabel('|R(\omega)|');
