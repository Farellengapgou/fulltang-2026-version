
# Modèles de services pour intégration
class AccountingService:
    """Service pour opérations comptables automatiques"""
    
    @staticmethod
    def create_consultation_entry(consultation):
        """Crée l'écriture comptable pour une consultation"""
        journal = Journal.objects.get(code='VTE')  # Journal des ventes
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=consultation.consultationDate.date(),
            description=f"Consultation {consultation.idPatient} - {consultation.idMedicalStaffGiver}",
            consultation=consultation,
            created_by=consultation.idMedicalStaffSender
        )
        
        # Ligne débit client
        client_account = ChartOfAccounts.objects.get(code='411001')
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=client_account,
            label=f"Consultation {consultation.idPatient}",
            debit_amount=consultation.consultationPrice
        )
        
        # Ligne crédit produit
        revenue_account = ChartOfAccounts.objects.get(code='7011')
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=revenue_account,
            label=f"Consultation {consultation.idPatient}",
            credit_amount=consultation.consultationPrice
        )

        entry.update_totals()
        return entry
    
    @staticmethod
    def create_payment_entry(bill, payment_amount, payment_method='CASH'):
        """Crée l'écriture d'encaissement"""
        journal = Journal.objects.get(code='CAI' if payment_method == 'CASH' else 'BQ')
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=timezone.now().date(),
            description=f"Encaissement facture {bill.billCode}",
            bill=bill,
            created_by=bill.operator
        )
        
        # Ligne débit trésorerie
        cash_account = ChartOfAccounts.objects.get(
            code='5711' if payment_method == 'CASH' else '5121'
        )
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=cash_account,
            label=f"Encaissement {bill.billCode}",
            debit_amount=payment_amount
        )
        
        # Ligne crédit client
        client_account = ChartOfAccounts.objects.get(code='411001')
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=2,
            account=client_account,
            label=f"Encaissement {bill.billCode}",
            credit_amount=payment_amount
        )

        entry.update_totals()
        return entry
    
    @staticmethod
    def create_supplier_invoice_entry(supplier, invoice_amount, vat_amount=0):
        """Crée l'écriture pour facture fournisseur"""
        journal = Journal.objects.get(code='ACH')  # Journal des achats
        
        entry = JournalEntry.objects.create(
            journal=journal,
            entry_date=timezone.now().date(),
            description=f"Facture {supplier.name}",
            created_by=supplier.created_by
        )
        
        # Ligne débit charge
        expense_account = ChartOfAccounts.objects.get(code='6031')  # Achats médicaments
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=1,
            account=expense_account,
            label=f"Achat {supplier.name}",
            debit_amount=invoice_amount,
            partner=supplier
        )
        
        # Ligne débit TVA si applicable
        if vat_amount > 0:
            vat_account = ChartOfAccounts.objects.get(code='4451')
            JournalEntryLine.objects.create(
                journal_entry=entry,
                sequence=2,
                account=vat_account,
                label="TVA déductible",
                debit_amount=vat_amount
            )
        
        # Ligne crédit fournisseur
        JournalEntryLine.objects.create(
            journal_entry=entry,
            sequence=3,
            account=supplier.account,
            label=f"Facture {supplier.name}",
            credit_amount=invoice_amount + vat_amount,
            partner=supplier
        )
        
        entry.update_totals()
        return entry

    @staticmethod
    def create_depreciation_entries(period_date):
        """Crée les écritures d'amortissement mensuelles"""
        entries_created = []
        
        for asset in Asset.objects.filter(is_active=True):
            monthly_depreciation = asset.calculate_annual_depreciation() / 12
            
            if monthly_depreciation > 0:
                journal = Journal.objects.get(code='OD')
                
                entry = JournalEntry.objects.create(
                    journal=journal,
                    entry_date=period_date,
                    description=f"Amortissement {asset.name}",
                    created_by=asset.created_by
                )
                
                # Ligne débit charge
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=1,
                    account=asset.expense_account,
                    label=f"Dotation amortissement {asset.name}",
                    debit_amount=monthly_depreciation
                )
                
                # Ligne crédit amortissement cumulé
                JournalEntryLine.objects.create(
                    journal_entry=entry,
                    sequence=2,
                    account=asset.depreciation_account,
                    label=f"Amortissement {asset.name}",
                    credit_amount=monthly_depreciation
                )
                
                entry.update_totals()
                entry.post(validated_by=asset.created_by)
                entries_created.append(entry)

        return entries_created