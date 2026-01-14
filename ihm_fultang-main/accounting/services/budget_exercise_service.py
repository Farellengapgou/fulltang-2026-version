from accounting.models import AccountState

immobilized_actives_prefixes = [str(i) for i in range(20, 29)]
circulant_actives_prefixes = [str(i) for i in range(30, 50)]
stable_resource_indexes = [str(i) for i in range(10, 20)]
treasury_indexes = [str(i) for i in range(50,60)]
circulant_passives_prefixes = [str(i) for i in range(40, 50)]
equity_indexes = [str(i) for i in range(10, 16)]
financial_debt_prefixes = [str(i) for i in range (16, 20)]
stock_indexes = {str(i) for i in range(30, 40)}

charges_prefixes = ['6']
products_prefixes = ['7']
sales_figure_prefixes = ['70', '71', '72', '73']
sold_goods_prefixes = ['60', '61', '62','63']
working_charges_prefixes = ['64', '65', '66', '67'] 

depreciation_allocations_prefixes = ['68']
provision_allocations_prefixes = ['69']
financial_charges_prefixes = ['67']
taxes_prefixes = ['89']

operating_cash_inflows_prefixes = ['70', '71', '72', '73']
operating_cash_outflows_prefixes = ['60', '61', '62', '63', '64', '65', '66']

investment_cash_inflows_prefixes = ['82']
investment_cash_outflows_prefixes = ['20', '21', '22', '23', '24', '25']

financing_cash_inflows_prefixes = ['16', '17']
financing_cash_outflows_prefixes = ['16', '17', '46']

dividends_paid_prefixes = ['46']
net_income_prefixes = ['13']

commitments_received_prefixes = ['90']
commitments_given_prefixes = ['91']


def calculate_balance(prefixes):
    balance = {}
    total = 0
    items = []
    for prefix in prefixes:
        item = {"accountNo":prefix, "label":ACCOUNTS_MAPPING.get(prefix, "Copte incomu"), "amount":0}
        account_states = AccountState.objects.filter(account__number__startswith=prefix)
        for state in account_states:
            item["amount"] += state.balance
            total += state.balance
        items.append(item)
    balance["items"] = items
    balance["total"] = total
    return balance

def calculate_treasury(prefixes, type):
    treasury = {}
    total = 0
    items = []
    for prefix in prefixes:
        item = {"accountNo":prefix, "label":ACCOUNTS_MAPPING.get(prefix, "Compte incomu"), "amount": 0}
        if type == "active":
            account_states = AccountState.objects.filter(account__number__startswith=prefix).filter(account__status="credit")
        else:
            account_states = AccountState.objects.filter(account__number__startswith=prefix).filter(account__status="debit")
        for state in account_states:
            item["amount"] += state.balance
            total += state.balance
        items.append(item)
    treasury['items'] = items
    treasury['total'] = total
    return treasury        

def calculate_circulant_balance(prefixes, type=None):
    balance = {}
    total = 0
    items = []
    for prefix in prefixes:
        item = {"accountNo":prefix, "label":ACCOUNTS_MAPPING.get(prefix, "Copte incomu"), "amount": 0}
        if type == "passive":
            account_states = AccountState.objects.filter(account__number__startswith=prefix).filter(account__status="creances")
        else:
            account_states = AccountState.objects.filter(account__number__startswith=prefix).filter(account__status="null")
        for state in account_states:
            item["amount"] += state.balance
            total['amount'] += state.balance
        items.append(item)
    balance['items'] = items
    balance['total'] = total
    return balance

ACCOUNTS_MAPPING = {
    "10": "Capital",
    "11": "Share premiums, merger premiums, contribution premiums",
    "12": "Reserves",
    "13": "Retained earnings",
    "14": "Net income for the year",
    "15": "Grants, provisions, and other equity funds",
    "16": "Borrowings and similar debts",
    "17": "Lease liabilities",
    "18": "Liaison accounts for branches and joint ventures",
    "19": "Provisions for risks and charges",

    "20": "Intangible assets",
    "21": "Tangible assets",
    "22": "Financial assets",
    "23": "Assets under construction",
    "24": "Assets allocated to specific activities",
    "25": "Depreciation of assets",
    "26": "Provisions for impairment of assets",

    "30": "Raw materials and supplies",
    "31": "Other supplies",
    "32": "Work in progress for goods",
    "33": "Work in progress for services",
    "34": "Intermediate and residual products",
    "35": "Merchandise",
    "36": "Provisions for impairment of inventory",

    "40": "Suppliers and related accounts",
    "41": "Customers and related accounts",
    "42": "Personnel and related accounts",
    "43": "Social security organizations",
    "44": "State and public authorities",
    "45": "Shareholders, current accounts",
    "46": "Sundry debtors and creditors",
    "47": "Suspense or clearing accounts",
    "48": "Provisions for impairment of third-party accounts",
    "49": "Commitments by signature",

    "50": "Marketable securities",
    "51": "Banks and financial institutions",
    "52": "Cash",
    "53": "Treasury instruments",
    "54": "Other financial accounts",
    "55": "Internal transfers",
    "56": "Bills payable",
    "57": "Bills receivable",
    "58": "Treasury adjustments",
    "59": "Provisions for impairment of financial accounts",

    "60": "Purchases",
    "61": "External services",
    "62": "Other external expenses",
    "63": "Taxes and duties",
    "64": "Personnel expenses",
    "65": "Other operating expenses",
    "66": "Financial expenses",
    "67": "Exceptional expenses",
    "68": "Depreciation and provisions",
    "69": "Employee profit-sharing, income taxes, and similar items",

    "70": "Sales of goods, finished products, and services",
    "71": "Stocked production",
    "72": "Capitalized production",
    "73": "Operating grants",
    "74": "Other operating income",
    "75": "Financial income",
    "76": "Exceptional income",
    "77": "Reversals of depreciation and provisions",
    "78": "Transfers of charges",
    "79": "Exceptional provisions",

    "80": "Special accounts",
    "81": "Analytical results",
    "82": "Analytical results by function",
    "83": "Commitment accounts",
    "84": "Heritage variation accounts",
    "85": "Counterpart accounts for commitments",
    "86": "Allocation accounts",
    "87": "Memorandum accounts",
    "88": "Closing and reopening accounts",
    "89": "Result allocation accounts",

    "90": "Commitments given",
    "91": "Commitments received"
}