# Documento de Requisitos (Formato EARS)

## Funcionalidade 1: Lista de Tarefas Real-Time
- **Ubiquitous (Sempre):** O sistema deve fornecer a capacidade de realizar a funcionalidade Lista de Tarefas Real-Time.
- **Event-Driven (Quando):** Quando adicionar uma nova tarefa no form, o sistema deve gravar a tarefa no db e publicar para os outros clientes.
- **State-Driven (Enquanto):** Enquanto o usuário estiver autenticado e com conexão ativa, o sistema deve permitir Lista de Tarefas Real-Time.
