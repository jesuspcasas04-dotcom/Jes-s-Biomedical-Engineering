% 1. (-5 - j) + (-3 + 4j) + 2 * (-0.5 - j)
op1 = (-5 - j) + (-3 + 4*j) + 2 * (-0.5 - j);
mod_op1=abs(op1);
fase_op1=angle(op1);


% 2. (-2j * (-1 - j) * 5j) + (-2 + j)
op2 = (-2*j * (-1 - j) * 5*j) + (-2 + j);
mod_op2=abs(op2);
fase_op2=angle(op2);

% 3. 1 / (2 - j)
op3 = 1 / (2 - j);
mod_op3=abs(op3);
fase_op3=angle(op3);

% 4. (2 - j) / (1 + j)
op4 = (2 - j) / (1 + j);
mod_op4=abs(op4);
fase_op4=angle(op4);

% 5. ((2j)^2) / (2 - 2j)
op5 = ((2*j)^2) / (2 - 2*j);

% 6. (1 - j)^2
op6 = (1 - j)^2;

% 7. 0.3 * exp(-5j)
op7 = 0.3 * exp(-5*j);

% 8. 0.1 * exp(1 + j)
op8 = 0.1 * exp(1 + j);

% 9. 0.2 * exp(-3j) - exp(0.2 + 3j)
op9 = 0.2 * exp(-3*j) - exp(0.2 + 3*j);

% Mostrar resultados en la consola
fprintf('Resultados en forma binómica:\n');
fprintf('1. %s\n', num2str(op1));
fprintf('2. %s\n', num2str(op2));
fprintf('3. %s\n', num2str(op3));
fprintf('4. %s\n', num2str(op4));
fprintf('5. %s\n', num2str(op5));
fprintf('6. %s\n', num2str(op6));
fprintf('7. %s\n', num2str(op7));
fprintf('8. %s\n', num2str(op8));
fprintf('9. %s\n', num2str(op9));


fprintf('Resultados en términos de módulo y fase de los 4 primeros:\n');
fprintf('Módulo 1. %s\n', num2str(mod_op1));
fprintf('Fase 1. %s\n', num2str(fase_op1));
fprintf('Módulo 2. %s\n', num2str(mod_op2));
fprintf('Fase 2. %s\n', num2str(fase_op2));
fprintf('Módulo 3. %s\n', num2str(mod_op3));
fprintf('Fase 3. %s\n', num2str(fase_op3));
fprintf('Módulo 4. %s\n', num2str(mod_op4));
fprintf('Fase 4. %s\n', num2str(fase_op4));
